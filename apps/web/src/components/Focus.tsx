import { Global, css } from '@emotion/react';

const GlobalStyles = css`
	/*
    This will hide the focus indicator if the element receives focus    via the mouse,
    but it will still show up on keyboard focus.
  */
	.js-focus-visible :focus:not([data-focus-visible-added]) {
		outline: none;
		box-shadow: none;
	}
`;

export const Focus = () => <Global styles={GlobalStyles} />;
