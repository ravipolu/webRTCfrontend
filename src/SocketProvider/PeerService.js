
class PeerService{
    constructor(){
        this.peer = new RTCPeerConnection()
        console.log(this.peer)
    }

    async getOffer (){
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer
        }
    }

    async getAnswer(offer){
        if(this.peer){
            await this.peer.setRemoteDescription(offer)
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans))
            return ans
        }
    }

    async setLocalDescription(ans){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
        }
    }

}

export default new PeerService;