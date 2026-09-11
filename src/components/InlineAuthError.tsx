import { CircleAlert } from "lucide-react";

export default function InlineAuthError({ id, message }: { id: string; message: string }) {
  return <p id={id} role="alert" className="auth-error">{message && <><CircleAlert size={16} aria-hidden="true" className="inline align-text-bottom" /> {message}</>}</p>;
}
