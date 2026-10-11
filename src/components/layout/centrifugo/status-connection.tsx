"use client";
import { useContext, useEffect, useRef } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { ToastContainer } from "react-toastify";
import { usePathname } from "next/navigation";
import {
  getSharedCentrifuge,
  getSubscriptionToken,
  prepareChannelSubscription,
  releaseChannelSubscription,
} from "~/lib/centrifugo/shared-centrifuge";

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

const getStatusFieldsFromPayload = (statusPayload: {
  text?: string;
  emoji?: string;
  online?: boolean;
  expiry?: number | string;
  status_expiry?: number | string;
  timeout?: string;
  status_timeout?: string;
  visibility?: string;
}) => ({
  text: statusPayload?.text ?? "",
  icon: statusPayload?.emoji ?? "",
  online: statusPayload?.online,
  status_expiry: statusPayload?.status_expiry ?? statusPayload?.expiry,
  status_timeout: statusPayload?.status_timeout ?? statusPayload?.timeout,
  status_visibility: statusPayload?.visibility,
});

export default function StatusConnection() {
  const { state, dispatch } = useContext(DataContext);
  const { orgId, user, orgMembers, mentionOrgMembers } = state;
  const params = usePathname();

  const routeUrl = `${CLIENT_URL}${params}`;
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const userRef = useRef(user);
  const orgMembersRef = useRef(orgMembers);
  const mentionOrgMembersRef = useRef(mentionOrgMembers);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    orgMembersRef.current = orgMembers;
  }, [orgMembers]);

  useEffect(() => {
    mentionOrgMembersRef.current = mentionOrgMembers;
  }, [mentionOrgMembers]);

  // centrifugo connection for notification
  useEffect(() => {
    if (!orgId) return;

    const centrifugeClient = getSharedCentrifuge();
    const sub = prepareChannelSubscription(centrifugeClient, orgId, {
      getToken: () => getSubscriptionToken(orgId),
    });

    const onPublication = (ctx: any) => {
      const data = ctx?.data;
      // console.log("Received publication on org:", data);

      if (data?.notification_type === "profile_status_updated") {
        const targetUserId =
          data?.modification_ids?.user_id || data?.data?.user_id;
        const statusPayload = data?.data?.status;

        if (!targetUserId || !statusPayload) return;

        const statusFields = getStatusFieldsFromPayload(statusPayload);
        const currentUser = userRef.current;

        if (
          currentUser &&
          String(targetUserId) === String(currentUser.user_id)
        ) {
          dispatch({
            type: ACTIONS.USER,
            payload: {
              ...currentUser,
              ...statusFields,
            },
          });

          try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (storedUser?.user_id || storedUser?.id) {
              localStorage.setItem(
                "user",
                JSON.stringify({
                  ...storedUser,
                  ...statusFields,
                })
              );
            }
          } catch {
            // ignore localStorage parse errors
          }
        }

        const members = orgMembersRef.current || [];
        const memberIndex = members.findIndex(
          (member: { id?: string; user_id?: string }) =>
            String(member.id) === String(targetUserId) ||
            String(member.user_id) === String(targetUserId)
        );

        if (memberIndex !== -1) {
          const updatedMembers = [...members];
          updatedMembers[memberIndex] = {
            ...updatedMembers[memberIndex],
            ...statusFields,
          };
          dispatch({ type: ACTIONS.ORG_MEMBERS, payload: updatedMembers });
        }

        const mentionMembers = mentionOrgMembersRef.current || [];
        const mentionMemberIndex = mentionMembers.findIndex(
          (member: { id?: string; user_id?: string }) =>
            String(member.id) === String(targetUserId) ||
            String(member.user_id) === String(targetUserId)
        );

        if (mentionMemberIndex !== -1) {
          const updatedMentionMembers = [...mentionMembers];
          updatedMentionMembers[mentionMemberIndex] = {
            ...updatedMentionMembers[mentionMemberIndex],
            ...statusFields,
          };
          dispatch({
            type: ACTIONS.MENTION_ORG_MEMBERS,
            payload: updatedMentionMembers,
          });
        }
      }

      if (data?.notification_type === "profile_updated") {
        dispatch({ type: ACTIONS.TRIGGER_CALLBACK });
      }
    };

    const onError = (ctx: any) => {
      console.log(`Subscription error: ${ctx.message}`);
    };

    sub.on("publication", onPublication);
    sub.on("error", onError);

    if (sub.state !== "subscribed") {
      sub.subscribe();
    }

    return () => {
      sub.off("publication", onPublication);
      sub.off("error", onError);
      releaseChannelSubscription(centrifugeClient, orgId, sub);
    };
  }, [dispatch, orgId]);

  //

  return (
    <div>
      <ToastContainer limit={1} />
      <audio controls ref={audioPlayer} style={{ display: "none" }}>
        <source src="/audio/new-sound.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
