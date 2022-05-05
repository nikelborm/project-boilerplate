export function isValidSession(toCheck: any) {
  try {
    return (
      typeof (toCheck === 'object') &&
      !Array.isArray(toCheck) &&
      toCheck !== null &&
      (toCheck.isAuthed === false ||
        (toCheck.isAuthed === true && 'authInfo' in toCheck))
    );
  } catch (e) {
    return false;
  }
}
