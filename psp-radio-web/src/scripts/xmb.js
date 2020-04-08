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
    title: 'COUNTERCULTURE',
    url: '../players/clip_alternative/index.html',
    iconUrl: '../players/clip_alternative/icon.png'
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
    title: 'India',
    url: '../players/clip_india/index.html',
    iconUrl: '../players/clip_india/icon.png'
  },
  {
    title: 'J-POP',
    url: '../players/clip_jpop/index.html',
    iconUrl: '../players/clip_jpop/icon.png'
  },
  {
    title: 'ANIMECAN',
    url: '../players/clip_anime/index.html',
    iconUrl: '../players/clip_anime/icon.png'
  },
  {
    title: 'GAME START',
    url: '../players/clip_game/index.html',
    iconUrl: '../players/clip_game/icon.png'
  },
  {
    title: 'Healing Time',
    url: '../players/clip_relax/index.html',
    iconUrl: '../players/clip_relax/icon.png'
  },
  {
    title: 'Soundtrack',
    url: '../players/clip_soundtrack/index.html',
    iconUrl: '../players/clip_soundtrack/icon.png'
  },
  {
    title: 'Hip Me, Hop You',
    url: '../players/os_HipMeHopYou/index.html',
    iconUrl: '../players/os_HipMeHopYou/icon.png'
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
