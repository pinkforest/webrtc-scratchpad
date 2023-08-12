function trace(msg) {
    var eventLog = document.getElementById("event-log");
    eventLog.textContent += msg + "\n";
}

function connectedMessage(e) {
    console.log("connectedMessage: %o", e);
}

function connect() {

    var steeringConn = new RTCPeerConnection({
        iceServers: [ { urls: "stun:stun.l.google.com:19302" } ]
    }, {
        optional: [{
        RtpDataChannels: true
        }]
    });
    
    steeringConn.addEventListener("icecandidate", (ev) => {
        console.log("steeringConn.icecandidate: %o", ev);
    }, false, );

    steeringConn.addEventListener("icecandidateerror", (ev) => {
        console.log("steeringConn.icecandidateerror: %o", ev);
    }, false, );
    
    steeringConn.addEventListener("iceconnectionstatechange", (ev) => {
        console.log("steeringConn.iceconnectionstatechange: %o", ev.target);
        trace("+ Connection change: " + steeringConn.connectionState);
    }, false, );

    steeringConn.addEventListener("signalingstatechange", (ev) => {
        console.log("steeringConn.signalingstatechange: %o", ev.target);
    }, false, );    
    
    steeringConn.addEventListener("datachannel", (ev) => {
        console.log("steeringConn.datachannel: %o", ev);
    }, false, );
    
    steeringConn.addEventListener("negotiationneeded", (ev) => {
        console.log("steeringConn.negotiationneeded: %o", ev);

        const candidate = new RTCIceCandidate({
            
            candidate: 'a=candidate:2 1 tcp 2105524479 192.168.88.252 9998 typ host tcptype active',
            sdpMid: '0',
        })

        steeringConn.createOffer()
            .then((offer) => negotiate_inject_answer(steeringConn,offer))

        trace("- Steering Connection negotiated.. hope not :D");
        
    }, false, );


    webChannel = steeringConn.createDataChannel("zero");
    webChannel.onopen = connectedOpen;
    webChannel.onclose = connectedClose;
    webChannel.onmessage = connectedMessage;
    
}

function negotiate_inject_answer(handleConn, offer) {
    handleConn.setLocalDescription(offer);
    const answer = generateInjectedAnswer(offer);
    handleConn.setRemoteDescription(answer);
}

function generateInjectedAnswer(offer) {

    // meh! scratch my back I scratch yours ? :O
    console.log("generateInjectedAnswer :: Offer: %o", offer);
    const answer_arr = [
        'v=0',
        'o=mozilla...THIS_IS_SDPARTA-99.0 7799211402828969668 0 IN IP4 0.0.0.0',
        's=-',
        't=0 0',
        'a=sendrecv',
        'a=fingerprint:sha-256 00:01:02:03:04:05:06:07:08:09:0A:DE:AD:BE:EF:DE:AD:BE:EF:DE:AD:BE:EF:DE:AD:BE:EF:DE:AD:BE:EE:EF',
        'a=group:BUNDLE 0',
        'a=ice-options:trickle',
        'a=msid-semantic:WMS *',
        'm=application 9998 UDP/DTLS/SCTP webrtc-datachannel',
        'c=IN IP4 0.0.0.0',
        'a=candidate:0 1 udp 2122252543 192.168.88.252 9998 typ host',
        'a=candidate:1 1 udp 2122252543 127.0.0.1 9998 typ srflx raddr 192.168.88.252 rport 9998',
        'a=sendrecv',
        'a=ice-pwd:7dcaac575215be63f979d4017de7bbaa',
        'a=ice-ufrag:8d8f89aa',
        'a=mid:0',
        'a=setup:active',
        'a=sctp-port:5000',
        'a=max-message-size:1073741823',
        'a=end-of-candidates'
    ];

    console.log("generateInjectedAnswer :: Answer:  " + answer_arr);
    
    return new RTCSessionDescription ( { type: "answer", sdp: answer_arr.join("\r\n") } );
}

function connectedOpen(evt) {
    console.log("connectedOpen: " + JSON.stringify(evt));    
}

function connectedClose(evt) {
    console.log("connectedClose: " + JSON.stringify(evt));
}
