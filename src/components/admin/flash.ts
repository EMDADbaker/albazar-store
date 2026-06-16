// Fire a confirmation toast from any admin client control. AdminFlash (mounted
// once in the dashboard layout) listens for this event and shows the message.
export function flashAdmin(message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('albazar:admin-flash', { detail: { message } }));
  }
}
