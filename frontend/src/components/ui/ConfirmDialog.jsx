import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({ open, title = "Are you sure?", text, onCancel, onConfirm, loading }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-4 text-sm text-slate-600">{text || "This action cannot be undone."}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Confirm</Button>
      </div>
    </Modal>
  );
}
