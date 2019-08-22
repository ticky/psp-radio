const DEFAULT_MENU = [
  {
    title: 'FreeRadio 1.7',
    url: '../players/FreeRadio/index.html',
    iconUrl: '../players/FreeRadio/icon.png'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu');

  DEFAULT_MENU.map(({ title, url, iconUrl }) => {
    const iconElement = document.createElement('img');
    iconElement.src = iconUrl;

    const titleElement = document.createTextNode(title);

    const linkElement = document.createElement('a');
    linkElement.href = `/app-worker-proxy/${url}`;
    linkElement.appendChild(iconElement);
    linkElement.appendChild(titleElement);

    menu.appendChild(linkElement);
  });
});
