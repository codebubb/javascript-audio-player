export default class AudioPlayer {
    constructor(selector = '.audioPlayer', audio = []) {
    this.playerElem = document.querySelector(selector)
    this.audio = audio
    this.currentAudio = null
    this.createPlayerElements()
    }
    createPlayerElements() {
        this.audioElem = document.createElement('audio')
        this.playlistElem = document.createElement('div')
        this.playlistElem.classList.add('playlist')

        this.playerElem.appendChild(this.audioElem)
        this.playerElem.appendChild(this.playlistElem)
    }
}
