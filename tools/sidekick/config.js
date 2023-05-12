/* eslint-disable no-console */
const preflight = ({ detail }) => {
  const sk = detail.data;
  // your custom code from button.action goes here
  console.log('config.js');
  sk.hide();
};

window.hlx.initSidekick({
  project: 'Turnerbund Wyhlen',
  plugins: [
    {
      id: 'preflight',
      condition: (sidekick) => sidekick.isHelix(),
      button: {
        text: 'Preflight',
        action: async (_, sk) => preflight(sk),
      },
    },
  ],
});
