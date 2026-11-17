type LinkToken =
  { status: "pending" } | { status: "ready"; token: string | null };

const PENDING: LinkToken = { status: "pending" };

let captured: LinkToken = PENDING;

const capture = (): LinkToken => {
  const token = window.location.hash.slice(1) || null;
  if (token) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }
  return { status: "ready", token };
};

export const subscribeLinkToken = () => () => undefined;

export const getLinkTokenState = (): LinkToken => {
  if (captured.status === "pending") captured = capture();
  return captured;
};

export const getServerLinkTokenState = (): LinkToken => PENDING;

export const getLinkToken = () => {
  const state = getLinkTokenState();
  return state.status === "ready" ? state.token : null;
};
