let currentIndex = 0;
let tracks = [];
let playlist = [];
let recognition;
let hasGreeted = false;


function startRecognition() {
    if (!sessionStorage.getItem('greeted')) {
        speak('hello, welcome to tuneMood, tell me any song you want to hear');
        sessionStorage.setItem('greeted', 'true');
    }

    if (!recognition || recognition.status === 'inactive') {
        recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            console.log('Command:', command);

            if (command === 'show my playlist') {
                window.location.href = 'playlist.html';
                speak('heres your playlist');
            } else if (command === 'open home') {
                speak('Done, here is home');
                redirectToHome();
            } else if (command.startsWith('next')) {
                speak('next song');
                playNext();
            } else if (command.startsWith('previous')) {
                speak('previous song');
                playPrevious();
            } else if (command.startsWith('add to playlist')) {
                speak('Added to playlist');
                addToPlaylist();
            } else {
                document.getElementById('searchInput').value = command;
                speak('Okay, I got this.');
                searchDeezer(command);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            recognition.start();
        };

        recognition.start();
    }
}


function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(voice => voice.name === 'Google US English Female');
    if (voice) {
        utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
}


function logVoices() {
    const voices = window.speechSynthesis.getVoices();
    console.log(voices);
}



function playNext() {
    const audioElement = document.querySelector('.minimusicplayer audio');
    if (audioElement) {
        audioElement.pause();
    }

    currentIndex = (currentIndex + 1 + tracks.length) % tracks.length;
    updateMiniPlayer(tracks[currentIndex]);
}

function playPrevious() {
    const audioElement = document.querySelector('.minimusicplayer audio');
    if (audioElement) {
        audioElement.pause();
    }

    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    updateMiniPlayer(tracks[currentIndex]);
}




function addToPlaylist(track) {
    if (!track || !track.album || !track.title || !track.artist || !track.preview) {
        console.error('Invalid track object:', track);
        return;
    }

    fetch('http://localhost:3000/add-to-playlist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cover: track.album.cover_medium,
            title: track.title,
            artist: track.artist.name,
            audio: track.preview,
        }),
    })
        .then(response => response.json())
        .then(data => console.log('Song added to playlist:', data))
        .catch(error => console.error('Error adding song to playlist:', error));
}



function displayPlaylist(data) {
    const playlistItems = document.getElementById('playlisttracksList');
    playlistItems.innerHTML = '';

    if (data.length > 0) {
        updateMiniPlayer(data[data.length-1]);
    }

    data.reverse().forEach((song, index) => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track-item');
        trackElement.addEventListener('click', () => {
            updateMiniPlayer(song)
            currentIndex = index;
        });

        const coverImg = document.createElement('img');
        coverImg.src = song.cover;
        coverImg.alt = song.title;
        coverImg.classList.add('cover-img');

        const trackInfo = document.createElement('div');
        trackInfo.classList.add('track-info');
        trackInfo.innerHTML = `
            <h3>${song.title}</h3>
            <p>Artist: ${song.artist}</p>
            <p>Album: ${song.album}</p>
        `;

        trackElement.appendChild(coverImg);
        trackElement.appendChild(trackInfo);

        playlistItems.appendChild(trackElement);
    });
}













function redirectToIndex() {
    window.location.href = 'index.html';
    speak('bye bye');
}

function redirectToHome() {
    window.location.href = 'home.html';
    speak('home');
}

function redirectToPlaylist() {
    window.location.href = 'playlist.html';
    speak('playlist');
}

function searchDeezer(query) {
    if (!query) {
        query = document.getElementById('searchInput').value;
    }
    const url = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${query}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'd289ea213bmshbf13fa9bb23e91fp14e339jsne13cee7331e3',
            'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
        }
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => displaySearchResults(data))
        .catch(error => console.error(error));
}

function displaySearchResults(data) {
    tracks = data.data;
    const tracksList = document.getElementById('tracksList');
    tracksList.innerHTML = '';

    if (data.data.length > 0) {
        updateMiniPlayer(data.data[0]);
    }

    tracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track-item');
        trackElement.addEventListener('click', () => updateMiniPlayer(track));

        const coverImg = document.createElement('img');
        coverImg.src = track.album.cover_medium;
        coverImg.alt = track.album.title;
        coverImg.classList.add('cover-img');

        const trackInfo = document.createElement('div');
        trackInfo.classList.add('track-info');
        trackInfo.innerHTML = `
            <h3>${track.title}</h3>
            <p>Artist: ${track.artist.name}</p>
            <p>Album: ${track.album.title}</p>
        `;

        trackElement.appendChild(coverImg);
        trackElement.appendChild(trackInfo);

        tracksList.appendChild(trackElement);
    });
}

function updateMiniPlayer(track) {
    const songIcon = document.querySelector('.minimusicplayer .songicon img');
    const songName = document.querySelector('.minimusicplayer .songname');
    const audioElement = document.querySelector('.minimusicplayer audio');

    songIcon.src = track.album.cover_medium;
    songName.innerText = `${track.title} - ${track.artist.name}`;

    if (audioElement) {
        audioElement.pause();
        audioElement.remove();
    }

    const newAudioElement = document.createElement('audio');
    newAudioElement.controls = true;
    newAudioElement.src = track.preview;
    newAudioElement.type = 'audio/mp3';
    newAudioElement.addEventListener('ended', playNext);

    document.querySelector('.minimusicplayer .audio-controls').appendChild(newAudioElement);

    newAudioElement.play();
}




function fetchPlaylist() {
    fetch('http://localhost:3000/get-playlist')
        .then(response => response.json())
        .then(data => {
            displayPlaylist(data);
            tracks = data;
        })
        .catch(error => console.error('Error fetching playlist:', error));
}

window.onload = fetchPlaylist;

function startPlaylist() {
    const playButton = document.querySelector('.minimusicplayer .play-button');
    playButton.addEventListener('click', () => {
        const audioElement = document.querySelector('.minimusicplayer audio');
        if (audioElement) {
            if (audioElement.paused) {
                audioElement.play();
            } else {
                audioElement.pause();
            }
        }
    });

    const nextButton = document.querySelector('.minimusicplayer .next-button');
    nextButton.addEventListener('click', playNext);

    const previousButton = document.querySelector('.minimusicplayer .previous-button');
    previousButton.addEventListener('click', playPrevious);
}



function updateMiniPlayer(track) {
    const songIcon = document.querySelector('.minimusicplayer .songicon img');
    const songName = document.querySelector('.minimusicplayer .songname');
    const audioElement = document.querySelector('.minimusicplayer audio');

    songIcon.src = track.cover;
    songName.innerText = `${track.title} - ${track.artist}`;

    if (audioElement) {
        audioElement.pause();
        audioElement.remove();
    }

    const newAudioElement = document.createElement('audio');
    newAudioElement.controls = true;
    newAudioElement.src = track.audio;
    newAudioElement.type = 'audio/mp3';
    newAudioElement.addEventListener('ended', playNext);

    document.querySelector('.minimusicplayer .audio-controls').appendChild(newAudioElement);

    newAudioElement.play();
}








// Example usage

startRecognition();
