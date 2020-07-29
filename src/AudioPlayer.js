export default class AudioPlayer {
    constructor(selector = '.audioPlayer', audio = []) {
        this.playerElem = document.querySelector(selector);
        this.audio = audio;
        this.currentAudio = null;
        this.createPlayerElements();
        this.audioContext = null;
    }

    createVisualiser() {
        this.audioContext = new AudioContext();
        this.src = this.audioContext.createMediaElementSource(this.audioElem);
        const analyser = this.audioContext.createAnalyser();
        const canvas = this.visualiserElem;
        const ctx = canvas.getContext('2d');
        this.src.connect(analyser);
        analyser.connect(this.audioContext.destination);
        analyser.fftSize = 128;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let bar;
        
        function renderFrame() {
            requestAnimationFrame(renderFrame);
            bar = 0;
            analyser.getByteFrequencyData(dataArray);
      
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
      
            for (let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i] - 75;
              const r = barHeight + (25 * (i/bufferLength));
              ctx.fillStyle = `rgb(${r}, 100, 50)`;
              ctx.fillRect(bar, canvas.height - barHeight, barWidth, barHeight);
              bar += barWidth + 2;
            }
          }

          renderFrame();
    }

    createPlayerElements() {
        this.audioElem = document.createElement('audio');
        this.audioElem.addEventListener('ended', this.playNext.bind(this));
        this.audioElem.ontimeupdate = this.updateTime.bind(this);
        const containerElem = document.createElement('div');
        containerElem.classList.add('container');
        this.playListElem = document.createElement('div');
        this.playListElem.classList.add('playlist');
        const playElem = document.createElement('button');
        playElem.classList.add('play');
        playElem.innerHTML = '<i class="fa fa-play"></i>';
        this.visualiserElem = document.createElement('canvas');
        
        const progressBarElem = document.createElement('div');
        progressBarElem.classList.add('progressBar');
        containerElem.appendChild(this.audioElem);
        containerElem.appendChild(this.playListElem);
        containerElem.appendChild(this.visualiserElem);
        this.playerElem.appendChild(containerElem);
        this.playerElem.appendChild(progressBarElem);
        this.createPlayListElements(this.playListElem);
        this.createProgressBarElements(progressBarElem);
    }

    createProgressBarElements(progressBarElem) {
        const container = document.createElement('div');
        container.classList.add('container');
        
        const previousBtn = document.createElement('button');
        const nextBtn = document.createElement('button');
        
        nextBtn.innerHTML = '<i class="fas fa-forward"></i>';
        previousBtn.innerHTML = '<i class="fas fa-backward"></i>';
        previousBtn.addEventListener('click', this.playPrevious.bind(this));
        nextBtn.addEventListener('click', this.playNext.bind(this));
            
        this.progressBar = document.createElement('canvas');
        this.progressBar.addEventListener('click', (e) => {
            const progressBarWidth = parseInt(window.getComputedStyle(this.progressBar).width);

            const amountComplete = ((e.clientX - this.progressBar.getBoundingClientRect().left) / progressBarWidth);
            this.audioElem.currentTime = (this.audioElem.duration || 0) * amountComplete;
        });
        this.timer = document.createElement('div');
        this.timer.classList.add('timer');

        container.appendChild(previousBtn);
        container.appendChild(this.timer);
        container.appendChild(nextBtn);
        progressBarElem.appendChild(container);
        progressBarElem.appendChild(this.progressBar);
    }

    updateCurrentAudio(nextAudio) {
        if (!this.audioContext) {
            this.createVisualiser();
        }

        this.setPlayIcon(this.currentAudio);
        this.currentAudio = nextAudio;  
        this.setPauseIcon(this.currentAudio);
        this.audioElem.src = this.currentAudio.getAttribute('href');
        this.audioElem.play();
    }

    playNext() {
        const index = this.audioElements.findIndex(audioItem => audioItem.getAttribute('href') === this.currentAudio.getAttribute('href'));
        const nextAudio = index >= this.audioElements.length - 1 ? this.audioElements[0] : this.audioElements[index+1];
        this.updateCurrentAudio(nextAudio);
    }

    playPrevious() {
        const index = this.audioElements.findIndex(audioItem => audioItem.getAttribute('href') === this.currentAudio.getAttribute('href'));
        const nextAudio = index <= 0 ? this.audioElements[this.audioElements.length-1] : this.audioElements[index -1];
        this.updateCurrentAudio(nextAudio);
   }


   updateTime() {
    const parseTime = time => {
        const seconds = String(Math.floor(time % 60) || 0).padStart('2', '0');
        const minutes = String(Math.floor(time / 60) || 0).padStart('2', '0');
        return `${minutes}:${seconds}`;
    };
    const { currentTime, duration } = this.audioElem;
    this.timer.innerHTML = `${parseTime(currentTime)}/${parseTime(duration)}`;

    this.updateProgressBar();
}

    updateProgressBar() {
        const progressSize = (current, overall, width) => (current / overall) * width;
        const { currentTime, duration } = this.audioElem;
        const progressCtx = this.progressBar.getContext('2d');
        
        progressCtx.fillStyle = '#000';
        progressCtx.fillRect(0, 0, this.progressBar.width, this.progressBar.height);
        
        progressCtx.fillStyle = '#65ac6b';
        progressCtx.fillRect(0, 0, progressSize(currentTime, duration, this.progressBar.width), this.progressBar.height);
    }

    createPlayListElements(playListElem) {
        this.audioElements = this.audio.map(audio => {
            const audioItem = document.createElement('a');
            audioItem.href = audio.url;
            audioItem.innerHTML = `<i class="fa fa-play"></i>${audio.name}`;
            this.setEventListener(audioItem);
            playListElem.appendChild(audioItem);
            return audioItem;
        });
        this.currentAudio = this.audioElements[0];
    }

    setEventListener(audioItem) {
        audioItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.audioContext) {
                this.createVisualiser();
            }
            const isCurrentAudio = audioItem.getAttribute('href') == (this.currentAudio && this.currentAudio.getAttribute('href'));

            if (isCurrentAudio && !this.audioElem.paused) {
                this.setPlayIcon(this.currentAudio);
                this.audioElem.pause();
            } else if (isCurrentAudio && this.audioElem.paused) {
                this.setPauseIcon(this.currentAudio);
                this.audioElem.play();

            } else {
                if (this.currentAudio) {
                    this.setPlayIcon(this.currentAudio);
                }
                this.currentAudio = audioItem;
                this.setPauseIcon(this.currentAudio);
                this.audioElem.src = this.currentAudio.getAttribute('href');
                this.audioElem.play();
            }

        })
    }

    setPauseIcon(elem) {
        const icon = elem.querySelector('i');
        icon.classList.add('fa-pause');
        icon.classList.remove('fa-play');
    }

    setPlayIcon(elem) {
        const icon = elem.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    };
}