/* globals AFRAME THREE */
AFRAME.registerComponent('brush', {
  schema: {
    color: { type: 'color', default: '#ef2d5e' },
    size: { default: 0.01, min: 0.001, max: 0.3 },
    brush: { default: 'potters-wheel' },
    enabled: { default: true }
  },
  init: function () {
    var data = this.data;
    this.color = new THREE.Color(data.color);

    this.el.emit('brushcolor-changed', {color: this.color});
    this.el.emit('brushsize-changed', {brushSize: data.size});

    this.activeL = false;
    this.activeR = false;

    const leftHandEl = this.el.querySelector("#left-hand");
    const rightHandEl = this.el.querySelector("#right-hand");

    this.leftHandObj = leftHandEl.object3D;
    this.rightHandObj = rightHandEl.object3D;

    this.currentStroke = null;
    this.strokeEntities = [];

    this.sizeModifier = 0.0;
    this.textures = {};
    this.currentMap = 0;

    this.model = this.el.getObject3D('mesh');
    this.drawing = false;

    var self = this;

    this.previousAxis = 0;

    /*
        this.el.addEventListener('axismove', function (evt) {
        if (evt.detail.axis[0] === 0 && evt.detail.axis[1] === 0 || this.previousAxis === evt.detail.axis[1]) {
            return;
        }

        this.previousAxis = evt.detail.axis[1];
        var size = (evt.detail.axis[1] + 1) / 2 * self.schema.size.max;

        self.el.parentEl.setAttribute('brush', 'size', size);
        });
    */
    this.el.addEventListener('buttondown', function (evt) {
      if (!self.data.enabled) { return; }
      // Grip
      if (evt.detail.id === 2) {
        self.system.undo();
      }
    });

    const onButtonChanged = (evt, leftHand) => {
      // Trigger
      if (evt.detail.id === 1) {
        var value = evt.detail.state.value;
        this.sizeModifier = value;

        var currentHandActive = value > 0.1;
        if (currentHandActive) {
          // if neither brush is active, start a new stroke
          if (!this.activeL && !this.activeR) {
            this.startNewStroke();
            console.log("Starting stroke");
          }
        }
        if (leftHand) {
          this.activeL = currentHandActive;
        } else {
          this.activeR = currentHandActive;
        }

        // if at the end both strokes are inactive, cleanup
        if (!this.activeL && !this.activeR) {
          this.previousEntity = this.currentEntity;
          this.currentStroke = null;
        }
      }
    }

    rightHandEl.addEventListener('buttonchanged', evt => onButtonChanged(evt, false));
    leftHandEl.addEventListener('buttonchanged', evt => onButtonChanged(evt, true));
  },
  update: function (oldData) {
    var data = this.data;
    if (oldData.color !== data.color) {
      this.color.set(data.color);
      this.el.emit('brushcolor-changed', {color: this.color});
    }
    if (oldData.size !== data.size) {
      this.el.emit('brushsize-changed', {size: data.size});
    }
  },
  tick: (() => {
    var positionL = new THREE.Vector3();
    var rotationL = new THREE.Quaternion();
    var scaleL = new THREE.Vector3();

    var positionR = new THREE.Vector3();
    var rotationR = new THREE.Quaternion();
    var scaleR = new THREE.Vector3();

    let pointerPosR = new THREE.Vector3();
    let pointerPosL = new THREE.Vector3();
    return function tick(time, delta) {
      if (this.activeL || this.activeR) {
        this.leftHandObj.matrixWorld.decompose(positionL, rotationL, scaleL);
        pointerPosL = this.system.getPointerPosition(positionL, rotationL, pointerPosL);

        this.rightHandObj.matrixWorld.decompose(positionR, rotationR, scaleR);
        pointerPosR = this.system.getPointerPosition(positionR, rotationR, pointerPosR);

        // if both brushes are active, use both pointerPos, else both pointerPos are from the active brush
        const point1 = this.activeL ? pointerPosL : pointerPosR;
        const point2 = this.activeL && !this.activeR ? pointerPosL : pointerPosR;

        // FIXME: really we should be passing BOTH rotationL and rotationR
        // and also positionL and position R
        // so that brushes can make use of multiple-controller rotation effects
        // (e.g. a lathe brush might use this)
        const rotation = this.activeL ? rotationL : rotationR;
        const position = this.activeL ? positionL : positionR;

        this.currentStroke.addPoint(position, rotation, point1, point2, this.sizeModifier, time);

      }
    };
  })(),
  startNewStroke: function () {
    this.currentStroke = this.system.addNewStroke(this.data.brush, this.color, this.data.size);
    this.el.emit('stroke-started', {entity: this.el, stroke: this.currentStroke});
  }
});
