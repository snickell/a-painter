AFRAME.registerBrush('potters-wheel',
  {
    init: function (color, width) {
      this.material = new THREE.MeshStandardMaterial({
        color: this.data.color,
        roughness: 0.6,
        metalness: 0.2,
        side: THREE.FrontSide,
        shading: THREE.SmoothShading
      });
      this.points = [];
      this.initialPoint = null;
    },
    regenerateMeshFromPoints: function (color, width) {
      if (this.mesh) this.object3D.remove(this.mesh);

      var geometry = new THREE.LatheBufferGeometry( this.points );
      var material = new THREE.MeshPhongMaterial( { color: this.data.color } );
      material.side = THREE.DoubleSide;
      
      this.mesh = new THREE.Mesh( geometry, material );
      this.object3D.add( this.mesh );
    },
    addPoint: function (position, orientation, pointerPosition1, pointerPosition2, pressure, timestamp) {
      if (pointerPosition1 === pointerPosition2) return;

      if (!this.initialPoint) {
        this.initialPoint = pointerPosition1.clone();
      }

      var newPointXZ = new THREE.Vector2(pointerPosition2.x, pointerPosition2.z);
      var initialPointXZ = new THREE.Vector2(this.initialPoint.x, this.initialPoint.z);
      var distanceXZ = newPointXZ.distanceTo(initialPointXZ);

      var newPoint = new THREE.Vector2(distanceXZ, pointerPosition2.y - this.initialPoint.y);

      this.points.push(newPoint);

      this.regenerateMeshFromPoints();

      this.mesh.position.x = this.initialPoint.x;
      this.mesh.position.z = this.initialPoint.z;
      this.mesh.position.y = this.initialPoint.y;
    }
  },
  {thumbnail: 'brushes/thumb_potters_wheel.png', spacing: 0.0}
);


/*

// x1, y1
initialPoint.x = 0
initialPoint.y = 0

// x2, y2
pointerPosition.x
pointerPosition.y





var angle1=2*Math.PI/3;
var angle2=Math.PI/6;

// u
var vec = pointerPosition.clone().sub(initialPoint);

var a3=vec.length();
var angle3=Math.PI-angle1-angle2;
var a2=a3*Math.sin(angle2)/Math.sin(angle3);

var RHS1=initialPoint.x*vec.x+initialPoint.y*vec.y+a2*a3*Math.cos(angle1);

var RHS2=pointerPosition.y*vec.x-pointerPosition.x*vec.y+a2*a3*Math.sin(angle1);
var x3=(1/(a3*a3))*(vec.x*RHS1-vec.y*RHS2);
var y3=(1/(a3*a3))*(vec.y*RHS1+vec.x*RHS2);

*/