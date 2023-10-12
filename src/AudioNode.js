
export class MidiNote {
    constructor(audioNode) {
        this.audioNode = audioNode;
    }

    isPlaying() {
        try {
            this.audioNode.stop();
            this.audioNode.start();
            return true;
        } catch {
            return false;
        }
    }
}