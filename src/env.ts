export const env = {
  get GH_TOKEN() { return process.env.GH_TOKEN; },
  get NOTES_REPO() { return process.env.NOTES_REPO; },
  get NOTES_OWNER() { return process.env.NOTES_OWNER; },
  get NOTES_BRANCH() { return process.env.NOTES_BRANCH; },
};
