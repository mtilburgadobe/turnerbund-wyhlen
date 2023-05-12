/* eslint-disable no-console */
const preflight = ({ detail }) => {
  const sk = detail.data;
  // your custom code from button.action goes here

  console.log('plugins.js');
  sk.hide();
};

const sk = document.querySelector('helix-sidekick');
sk.addEventListener('custom:preflight', preflight);
