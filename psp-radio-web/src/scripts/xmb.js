const DEFAULT_MENU = [
  {
    title: 'INTERNET RADIO PLAYER I',
    url: '../players/PLAYER_I/index.html',
    iconUrl: '../players/PLAYER_I/icon.png'
  },
  {
    title: 'INTERNET RADIO PLAYER II',
    url: '../players/PLAYER_II/index.html',
    iconUrl: '../players/PLAYER_II/icon.png'
  },
  {
    title: 'Back to the 80\'s',
    url: '../players/clip_80s/index.html',
    iconUrl: '../players/clip_80s/icon.png'
  },
  {
    title: 'ROCK',
    url: '../players/clip_rock/index.html',
    iconUrl: '../players/clip_rock/icon.png'
  },
  {
    title: 'BRITISH CULTURE',
    url: '../players/clip_british/index.html',
    iconUrl: '../players/clip_british/icon.png'
  },
  {
    title: 'All The Classics',
    url: '../players/clip_classic/index.html',
    iconUrl: '../players/clip_classic/icon.png'
  },
  {
    title: 'Jazz in 246',
    url: '../players/clip_jazz/index.html',
    iconUrl: '../players/clip_jazz/icon.png'
  },
  {
    title: 'FreeRadio 1.7',
    url: '../players/FreeRadio/index.html',
    iconUrl: '../players/FreeRadio/icon.png'
  },
  {
    title: 'About Internet Radio',
    url: 'http://web.archive.org/web/20140704222439id_/http://www.playstation.com/psp-app/radio/index.html',
    iconUrl: require('../images/about_icon.png')
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu');

  DEFAULT_MENU.map(({ title, url, iconUrl }) => {
    const iconElement = document.createElement('img');
    iconElement.src = iconUrl;

    const titleElement = document.createTextNode(title);

    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.appendChild(iconElement);
    linkElement.appendChild(titleElement);

    menu.appendChild(linkElement);
  });
});
