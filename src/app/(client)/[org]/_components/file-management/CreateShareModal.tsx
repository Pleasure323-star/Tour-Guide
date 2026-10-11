"use client";

import React, {
  useEffect,
  useRef,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Globe,
  Link2,
  Lock,
  X,
} from "lucide-react";
import { FileDetails } from "./FileInfo";

interface CreateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileToShare: FileDetails | null;
}

type AccessType = "Restricted" | "public";
type RestrictionType = "view" | "edit";

const CreateShareModal: React.FC<CreateShareModalProps> = ({
  isOpen,
  onClose,
  fileToShare,
}) => {
  const [emailTags, setEmailTags] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [restrict, setRestrict] = useState<RestrictionType>("view");
  const [toggleRestrict, setToggleRestrict] = useState(false);
  const [message, setMessage] = useState("");
  const [accessType, setAccessType] = useState<AccessType>("Restricted");
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [showSelectCanView, setShowSelectCanView] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsCopied(false);
    setCopyError(null);
    if (copyResetTimer.current) {
      clearTimeout(copyResetTimer.current);
      copyResetTimer.current = null;
    }
  }, [fileToShare?.file_link]);

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
        copyResetTimer.current = null;
      }
      setCopyError(null);
      setIsCopied(false);
    };
  }, []);

  const handleEmailKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmailTag();
    } else if (
      e.key === "Backspace" &&
      emailInput === "" &&
      emailTags.length > 0
    ) {
      removeEmailTag(emailTags.length - 1);
    }
  };

  const addEmailTag = () => {
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail && !emailTags.includes(trimmedEmail)) {
      setEmailTags([...emailTags, trimmedEmail]);
      setEmailInput("");
    }
  };

  const removeEmailTag = (indexToRemove: number) => {
    setEmailTags(emailTags.filter((_, index) => index !== indexToRemove));
  };

  const handleViewSelect = () => {
    setShowSelectCanView((state) => !state);
  };

  const handleRestrictionChange = (type: RestrictionType) => {
    setRestrict(type);
    setShowSelectCanView(false);
    setToggleRestrict(false);
  };

  const handleToggleRestrict = () => {
    setToggleRestrict((state) => !state);
  };

  const handleAccessChange = (type: AccessType) => {
    setAccessType(type);
    setShowSelectCanView(false);
  };

  const copyTextToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (!succeeded) {
      throw new Error("Copy command failed");
    }
  };

  const handleCopyLink = async () => {
    const link = fileToShare?.file_link?.trim();
    if (!link) {
      setCopyError("No file link available to copy.");
      setIsCopied(false);
      return;
    }
    try {
      setCopyError(null);
      await copyTextToClipboard(link);
      setIsCopied(true);
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }
      copyResetTimer.current = setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setIsCopied(false);
      setCopyError("Couldn't copy the link. Please try again.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setMessage("");
      setAccessType("Restricted");
      setShowSelectCanView(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="">
        <DialogHeader className="flex flex-row items-center -mx-6 px-6 justify-between border-b border-[#7141f8]">
          <DialogTitle className="font-semibold mb-6">
            Share {fileToShare ? fileToShare.file_name : "this file"}{" "}
          </DialogTitle>
        </DialogHeader>

        <div className="">
          {/* Add people with tags */}
          <div>
            <label
              htmlFor="share-emails"
              className="block text-sm font-medium mb-2"
            >
              Add people
            </label>
            <div className="flex flex-wrap relative justify-between items-start gap-2 p-2 border rounded-md focus-within:border-[#7141f8] focus-within:ring-2 focus-within:ring-[#7141f8]/20 transition-all">
              <div className="w-3/5">
                {emailTags.map((email, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 mx-2 my-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                  >
                    {email}
                    <button
                      onClick={() => removeEmailTag(index)}
                      className="hover:text-gray-900 focus:outline-none"
                      aria-label={`Remove ${email}`}
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </span>
                ))}
                <input
                  id="share-emails"
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={addEmailTag}
                  placeholder={
                    emailTags.length === 0 ? "Add people to send link to" : ""
                  }
                  className="flex-1 w-full outline-none bg-transparent text-[#344054] placeholder:text-[#344054] px-2 py-1"
                />
              </div>
              <div className="">
                <Button
                  onClick={handleToggleRestrict}
                  variant="outline"
                  className="flex items-center"
                >
                  <span className="text-[#344054]">
                    {restrict === "view" ? "Can view" : "Can Edit"}
                  </span>

                  {toggleRestrict ? (
                    <ChevronUp
                      className="text-[#667085]"
                      width={16}
                      height={16}
                    />
                  ) : (
                    <ChevronDown
                      className="text-[#667085]"
                      width={16}
                      height={16}
                    />
                  )}
                </Button>
              </div>

              {toggleRestrict && (
                <ul className="text-[15px] shadow-lg font-normal right-2 top-16 w-[127px] overflow-hidden cursor-pointer absolute text-[#1D2939] bg-white rounded-[7px]">
                  <li
                    onClick={() => handleRestrictionChange("view")}
                    className={`${restrict === "view" && "bg-[#F1F1FE] text-[#5F5FE1]"} flex px-4 py-[10px] gap-2 items-center`}
                  >
                    {restrict === "view" ? (
                      <Check width={13} height={13} className="" />
                    ) : (
                      <Eye width={13} height={13} className="" />
                    )}
                    <p>Can View</p>
                  </li>
                  <li
                    onClick={() => handleRestrictionChange("edit")}
                    className={`${restrict === "edit" && "bg-[#F1F1FE] text-[#5F5FE1]"} flex px-4 py-[10px] gap-2 items-center`}
                  >
                    {restrict === "edit" ? (
                      <Check width={13} height={13} className="" />
                    ) : (
                      <Edit width={13} height={13} className="" />
                    )}
                    <p>Can Edit</p>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="text-[#344054] text-[12px] ">
          <label htmlFor="share-note" className="block text-sm  mb-2">
            Message
          </label>
          <textarea
            name=""
            // className="w-full text-[#344054] placeholder:text-[#344054] min-h-[82px] rounded-[6px] px-4 py-2 focus:border-[#7141f8] border"
            className="w-full text-[#344054] placeholder:text-gray-400 min-h-[82px] rounded-[6px] px-4 py-2 border focus:border-[#7141f8] focus:ring-2 focus:ring-[#7141f8]/20 outline-none transition-all"
            id="share-note"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add additional notes"
          ></textarea>
        </div>

        <div className="text-[#667085] relative text-[12px] leading-[18px]">
          <h2>Access</h2>

          <div className="flex text-[15px] items-center gap-1">
            {accessType === "Restricted" ? (
              <Lock width={13} height={13} />
            ) : (
              <Globe width={13} height={13} className="" />
            )}
            <button
              onClick={handleViewSelect}
              className="flex items-center gap-2 focus:outline-none"
            >
              <span className="text-[#1D2939]">
                {accessType === "Restricted"
                  ? "Only those invited"
                  : "Anyone with link"}
              </span>
              <div className="">
                {showSelectCanView ? (
                  <ChevronUp className="text-center" width={16} height={16} />
                ) : (
                  <ChevronDown className="text-center" width={16} height={16} />
                )}
              </div>
            </button>
          </div>
          {showSelectCanView && (
            <ul className="text-[15px] shadow-lg overflow-hidden cursor-pointer absolute left-8 text-[#1D2939] bg-white rounded-[7px] w-fit">
              <li
                onClick={() => handleAccessChange("public")}
                className={`${accessType === "public" && "bg-[#F1F1FE] text-[#5F5FE1]"} flex px-4 py-[8px] gap-2 items-center`}
              >
                {accessType === "public" ? (
                  <Check width={13} height={13} className="" />
                ) : (
                  <Globe width={13} height={13} className="" />
                )}

                <p>Anyone with Link</p>
              </li>
              <li
                onClick={() => handleAccessChange("Restricted")}
                className={`${accessType === "Restricted" && "bg-[#F1F1FE] text-[#5F5FE1]"} flex px-4 py-[8px] gap-2 items-center`}
              >
                {accessType === "Restricted" ? (
                  <Check width={13} height={13} className="" />
                ) : (
                  <Lock width={13} height={13} className="" />
                )}
                <p>Only those invited</p>
              </li>
            </ul>
          )}
        </div>

        <DialogFooter className="pt-">
          <Button
            onClick={handleCopyLink}
            className="text-[#5F5FE1] flex gap-1 border mr-auto"
          >
            <Link2 strokeWidth={1.5} height={25} className="font-light" />
            <span className="p-0 text-[13px]">Copy link</span>
          </Button>
          <DialogClose asChild>
            <Button className="border px-4 py-[7px] text-[#344054] border-[neutral-300]">
              Cancel
            </Button>
          </DialogClose>
          <Button className="bg-[#7141f8] text-white px-6 py-3 hover:bg-[#7141f8]/90">
            Send
          </Button>
        </DialogFooter>

        {isCopied && (
          <div className="absolute text-[16px] left-1/2 right-1/2 transform -translate-x-1/2 flex w-1/2 rounded-lg items-center px-4 py-2 justify-between text-white bottom-0 bg-[#1C1C1C]">
            <span className="">Link copied</span>
            <Check />
          </div>
        )}
        {copyError && (
          <div
            role="alert"
            className="absolute text-[14px] left-1/2 right-1/2 transform -translate-x-1/2 flex w-1/2 rounded-lg items-center px-4 py-2 justify-between text-white bottom-0 bg-[#B42318]"
          >
            <span className="">{copyError}</span>
            <X width={16} height={16} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateShareModal;
