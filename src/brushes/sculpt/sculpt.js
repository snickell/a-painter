/* globals AFRAME THREE */
AFRAME.registerBrush('sculpt',
  {
    init: function (color, width) {
      this.initBlob();
      console.log(this.object3D, this.convertCurrentPointsToObject.bind(this));
    },
    updateBlob: function () {
      //this.blob.reset();
      for (var i = this.lastPointAddedToBlob; i < this.points.length; i++) {

        var point = this.points[i];
        var position = point.position;
        this.blob.addBall(position.x, position.y, position.z, point.strength, point.subtract);
      }
      this.lastPointAddedToBlob = this.points.length;
    },
    convertCurrentPointsToObject: function () {
      this.points.shift();
      this.points.shift();

      this.updateBlob();

      var geometry = this.blob.generateGeometry();
      var mesh = new THREE.Mesh(geometry, this.blob.material.clone());
      mesh.position.y = 1;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.object3D.add(mesh);

      this.initPoints();
    },
    initPoints: function () {
      console.log("initPoints called");
      this.points = [
        { position: new THREE.Vector3(), strength: - 0.08, subtract: 10 },
        { position: new THREE.Vector3(), strength: 0.04, subtract: 10 }
      ];
    },
    initBlob: function () {
      var material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: reflectionCube,
        roughness: 0.9,
        metalness: 0.0
      });
      this.blob = new THREE.MarchingCubes(64, material, true);
      this.blob.position.y = 1;

      this.object3D.add(this.blob);  

      this.initPoints();
      this.lastPointAddedToBlob = 0;
    },    
    addPoint: function (position, orientation, pointerPosition1, pointerPosition2, pressure, timestamp) {
      var strength = 0.02; // FIXME: use strength

      this.points.push({ position: pointerPosition1, strength: strength, subtract: 10 });

      return true;
    },
    tick: function (time, delta) {
      this.updateBlob();
    }    
  },
  { thumbnail: 'brushes/thumb_sculpt.png', spacing: 0.0 }
);
