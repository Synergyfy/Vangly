"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import {
  CheckCircle2,
  Sparkles,
  Send,
  Wallet,
  ClipboardList,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./Button";
import "./SuccessModal.css";

export type SuccessIcon =
  | "check"
  | "sparkles"
  | "send"
  | "wallet"
  | "form"
  | "shield";

interface SuccessAction {
  label: string;
  onClick?: () => void;
  navigateTo?: string;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: SuccessIcon;
  primaryAction?: SuccessAction;
  secondaryAction?: SuccessAction;
  preventBackdropClose?: boolean;
}

const ICON_MAP: Record<SuccessIcon, LucideIcon> = {
  check: CheckCircle2,
  sparkles: Sparkles,
  send: Send,
  wallet: Wallet,
  form: ClipboardList,
  shield: ShieldCheck,
};

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  icon = "check",
  primaryAction,
  secondaryAction,
  preventBackdropClose = true,
}: SuccessModalProps) {
  const router = useRouter();
  const Icon = ICON_MAP[icon];

  const handleClose = () => {
    onClose();
  };

  const runAction = (action: SuccessAction | undefined) => {
    if (!action) return;
    if (action.navigateTo) {
      onClose();
      router.push(action.navigateTo);
      return;
    }
    if (action.onClick) {
      action.onClick();
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={preventBackdropClose ? () => undefined : handleClose}
      title=""
      size="sm"
    >
      <div className="success-modal-body">
        <div className="success-icon-wrap">
          <div className="success-icon-ring" aria-hidden="true" />
          <div className="success-icon-badge" aria-hidden="true">
            <Icon size={32} strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="success-title">{title}</h2>
        {description ? <p className="success-description">{description}</p> : null}
        <div className="success-actions">
          {primaryAction ? (
            <Button
              fullWidth
              size="lg"
              onClick={() => runAction(primaryAction)}
            >
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              fullWidth
              size="lg"
              variant="ghost"
              onClick={() => runAction(secondaryAction)}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
          {!primaryAction && !secondaryAction ? (
            <Button fullWidth size="lg" onClick={handleClose}>
              Okay
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
