

    function Soundtrack() {
        var self = this;

        this.bg = {
            noise: new Tone.Noise("white"),
            filter: new Tone.Filter(200, "bandpass"),
            filter2: new Tone.Filter(250, "bandpass"),
            create: function() {
                // first filter
                this.filter.Q.value = 100
                this.noise.volume.value = 25;
                this.noise.connect(this.filter)
                this.filter.toMaster();
                // second filter
                this.filter2.Q.value = 70
                this.noise.connect(this.filter2)
                this.filter2.toMaster();

            },
            start: function() {
                this.noise.start();
            },
            stop: function() {
                this.noise.stop();
            }
        }

        this.ping = {
            create: function() {
            /*    this.osc = new Tone.Oscillator(400, "sine")
                this.osc.toMaster() */

                this.synth = new Tone.PolySynth(6, Tone.MonoSynth)

                this.synth.set({
                    "oscillator" : {
                        "type" : "sine"
                    },
                    "filterEnvelope" : {
                        "attack" : 0.01,
                        "decay" : 0.5,
                        "sustain" : 0.3,
                        "release" : 2,
                    },
                    "envelope" : {
                        "attack" : 0.01,
                        "decay" : 0.01,
                        "sustain" : 0.4,
                        "release" : 3,
                    }

                });

                for (var i=0;i<this.synth.voices.length;i++) {
                    this.synth.voices[i].filter.Q.value = 0
                    this.synth.voices[i].filter.type = "allpass"
                }

                this.synth.toMaster()
            },
            note: function() {
                note = Math.floor(Math.random()*8)*50+100;
              //  this.synth.triggerAttackRelease(note, 0.1);
                sounds.stack.push(this.synth.triggerAttackRelease.bind(this.synth,note,0.1))
           
              //  this.osc.start();
            }
        }
        this.dude = {
            create: function() {
                
                this.drum = new Tone.Player("audio/kick.wav")
                this.drum.toMaster()
                this.drum2 = new Tone.Player("audio/hihat.wav")
                this.drum2.toMaster()
                this.drum3 = new Tone.Player("audio/jump.wav")
                this.drum3.toMaster()

            },
            turn: function() {
                sounds.stack.push(sounds.dude.drum2.start.bind(sounds.dude.drum2))
            },
            jump: function() {
                sounds.stack.push(sounds.dude.drum3.start.bind(sounds.dude.drum3))
              //  sounds.dude.drum3.start()
            },
            land: function() {
                sounds.stack.push(sounds.dude.drum.start.bind(sounds.dude.drum))
             //   sounds.dude.drum.start()
            },
        }

        this.setup = function() {
            this.bg.create();
            this.ping.create();
            this.dude.create();
        }

        this.stack = []

        this.setup();

    }

    Tone.Transport.setInterval(function(time){   
        if (sounds.stack.length>0) {
            for (var i=0;i<sounds.stack.length;i++) {
                sounds.stack[i]();
            }
            sounds.stack = []
        }
    }, .1);

    Tone.Transport.start()
