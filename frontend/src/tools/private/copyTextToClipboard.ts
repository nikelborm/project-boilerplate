export function copyTextToClipboard(
  text: string,
  onSuccess: () => void,
  onError: (...args: any[]) => void,
) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text, onSuccess, onError);
    return;
  }
  navigator.clipboard.writeText(text).then(onSuccess, onError).catch(onError);
}

function fallbackCopyTextToClipboard(
  text: string,
  onSuccess: () => void,
  onError: (...args: any[]) => void,
) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      onSuccess();
    } else {
      onError();
    }
  } catch (err) {
    onError(err);
  }

  document.body.removeChild(textArea);
}
