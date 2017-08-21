/* global VERSION */
'use strict'

// Import everything
import { inform, exec } from 'ef.js'
import content from './bplayer.eft'
import './bplayer.css'

const response = function(state) {
	if (state.$element.clientWidth <= 460) {
		state.$data.narrow = true
	} else {
		state.$data.narrow = false
	}
}

const formatTime = function (sec) {
	const hours = Math.floor(sec / 3600)
	const minutes = Math.floor((sec - (hours * 3600)) / 60)
	const seconds = Math.floor(sec - (hours * 3600) - (minutes * 60))

	let hs = ''
	let ms = ''
	let ss = ''

	hs = `${hours}:`
	if (isNaN(minutes)) ms = '00:'
	else ms = `${minutes}`
	if (isNaN(seconds)) ss = '00'
	else ss = `${seconds}`
	if (hours < 10) hs = `0${hours}:`
	if (minutes < 10) ms = `0${minutes}:`
	if (seconds < 10) ss = `0${seconds}`
	if (isNaN(hours) || hours <= 0) hs = ''
	return `${hs}${ms}${ss}`
}

// Get all methods ready
const methods = {
	seek({state: {$refs: {playControl, audio}}, e}) {
		const w = playControl.clientWidth
		const x = e.offsetX
		if (x >= 0 && x <= w) audio.currentTime = x / w * audio.duration
	},
	progressDown({state: {status}}) {
		status.progressdown = true
	},
	progressUp({state: {status}}) {
		status.progressdown = false
	},
	dragSeek({state: {$refs: {playControl, audio}, status}, e}) {
		if (status.progressdown) {
			const w = playControl.clientWidth
			const x = e.offsetX
			if (x >= 0 && x <= w) audio.currentTime = x / w * audio.duration
		}
	},
	touchSeek({state: {$refs: {playControl, audio}, status}, e}) {
		if (status.progressdown) {
			const w = playControl.clientWidth
			const x = e.touches[0].pageX - e.target.getBoundingClientRect().left
			if (x >= 0 && x <= w) audio.currentTime = x / w * audio.duration
		}
	},
	setVol({state: {$refs: {audio}}, e}) {
		const x = e.offsetX
		if (x >= 0 && x <= 80) audio.volume = x / 80
	},
	volDown({state: {status}}) {
		status.volumedown = true
	},
	volUp({state: {status}}) {
		status.volumedown = false
	},
	dragVol({state: {$data, status}, e}) {
		if (status.volumedown) {
			const x = e.offsetX
			if (x >= 0 && x <= 80) $data.volume = x / 80
		}
	},
	touchVol({state: {$data, status}, e}) {
		if (status.volumedown) {
			const x = e.touches[0].pageX - e.target.getBoundingClientRect().left
			if (x >= 0 && x <= 80) $data.volume = x / 80
		}
	},
	toggleMute({state: {$data, $refs: {audio}}}) {
		$data.muted = !audio.muted
	},
	togglePlay({state: {$refs: {audio}}}) {
		if (audio.paused) audio.play()
		else audio.pause()
	},
	toggleLoop({state: {$data, $refs: {audio}}}) {
		$data.loop = !audio.loop
	},
	seeking({state: {$refs: {audio}, $methods, status}}) {
		// Cancle last seek before creating a new one
		if (status.seekID) window.clearTimeout(status.seekID)

		const currentTime = audio.currentTime
		const paused = audio.paused
		const resume = () => {
			status.seekID = 0
			$methods.resume = null
			audio.currentTime = currentTime
			if (!paused) audio.play()
		}
		status.seekID = window.setTimeout(() => {
			audio.load()
			$methods.resume = resume
		}, 500)
	},
	seeked({state: {status}}) {
		window.clearTimeout(status.seekID)
		status.seekID = 0
	},
	timeupdate({state, state: {$refs: {audio: {currentTime, duration}}}}) {
		state.$data = {
			played: currentTime / duration * 100,
			current: formatTime(currentTime)
		}
	},
	progress({state, state: {$refs: {audio}}}) {
		const bufferedLength = audio.buffered.length
		const duration = audio.duration
		const newData = {
			total: formatTime(duration)
		}
		if (bufferedLength >= 1) newData.loaded = audio.buffered.end(bufferedLength - 1) / duration * 100
		state.$data = newData
	},
	volumechange({state: {$data, $refs: {audio}}}) {
		$data.vol = audio.volume * 80
	},
	play({state, state: {$refs: {audio: {currentTime}}}}) {
		state.$data = {
			playHidden: 'hidden_bplayer',
			pauseHidden: '',
			current: formatTime(currentTime)
		}
	},
	pause({state, state: {$refs: {audio: {currentTime}}}}) {
		state.$data = {
			playHidden: '',
			pauseHidden: 'hidden_bplayer',
			current: formatTime(currentTime)
		}
	},
	ended({state: {$refs: {audio}}}) {
		if (!audio.loop) audio.pause()
	}
}

// Get all subscription methods ready
const makeNarrow = ({state: {$data}, value}) => {
	if (value) $data.narrowClass = 'narrow_bplayer'
	else $data.narrowClass = ''
}

const makeSlim = ({state: {$data}, value}) => {
	if (value) $data.slimClass = 'slim_bPlayer'
	else $data.slimClass = ''
}

const makeMute = ({state: {$data}, value}) => {
	if (value) $data.volDisabled = 'disabled_bplayer'
	else $data.volDisabled = ''
}

const makeLoop = ({state: {$data}, value}) => {
	if (value) $data.loopDisabled = ''
	else $data.loopDisabled = 'disabled_bplayer'
}

// Prepare defaults
// const defaults = {
// 	src: '',
// 	cover: '',
// 	title: 'Unknown',
// 	artist: 'Unknown',
// 	color: '#A91212',
// 	volume: 1,
// 	muted: false,
// 	autoplay: false,
// 	loop: false,
// 	slim: false,
// 	narrow: false
// }

const bPlayer = class extends content {
	constructor(data) {
		// Initialize data
		// data = Object.assign({}, defaults, data || {})
		// Hold all operations
		inform()

		super({$methods: methods})

		this.status = {
			progressdown: false,
			volumedown: false,
			seekID: 0
		}

		// Subscribe all values
		this.$subscribe('narrow', makeNarrow)
		this.$subscribe('slim', makeSlim)
		this.$subscribe('muted', makeMute)
		this.$subscribe('loop', makeLoop)

		this.$data = data

		// Make player size responsible
		window.addEventListener('resize', () => response(this))
		// response(this)

		// Render
		exec()
	}

	get paused() {
		return this.$refs.audio.paused
	}

	play() {
		this.$refs.audio.play()
		return this
	}

	pause() {
		this.$refs.audio.pause()
		return this
	}

	static get version() {
		return VERSION
	}
}

export default bPlayer

// Set style for info
const ls1 = `
background-color: #A91212;
font-weight: bold;
color: #FFF;
font-size: 20px;
`
const ls2 = `
background-color: #531212;
font-weight: bold;
color: #FEDCBA;
font-size: 20px;
`
const ls3 = `
background-color: #000;
font-weight: bold;
color: #FEDCBA;
font-size: 12px;
`
// Show information when bPlayer loaded successfully.
console.log(`%c bPlayer-ef %c v${VERSION} \n%c See https://bplayer-ef.ccoooss.com/ for detail. `, ls1, ls2, ls3)
