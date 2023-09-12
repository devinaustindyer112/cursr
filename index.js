let cursr = (function () {
  // Utility functions

  function cursorSet(src) {
    document.body.style.cursor = `url(${src}), pointer`;
  }

  function canvasCreate() {
    let canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
  }

  function preRender(src) {
    const image = new Image();
    image.src = src;
    return image;
  }

  function vecSubtract(vector, minus) {
    return {
      x: vector.x - minus.x,
      y: vector.y - minus.y,
    };
  }

  // Display factory

  function createDisplay() {
    let cursor = { x: 0, y: 0 };
    let canvas = canvasCreate();
    let context = canvas.getContext("2d");
    let elements = [];

    document.addEventListener("mousemove", (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    });
    document.body.appendChild(canvas);

    return {
      canvas,
      elements,
      cursor,

      addElement: function addElement(element) {
        elements.push(element);
      },

      updateElements: function updateElements() {
        elements = elements.filter((element) => {
          return element.valid();
        });
        elements.forEach((element) => {
          element.update();
        });
      },

      drawElements: function drawElements() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        elements.forEach((element) => {
          element.draw(context);
        });
      },
    };
  }

  // Element factory

  // Can I decompose this as well? Like the createDisplay factory?

  function createElement(src, x, y, update) {
    return {
      image: preRender(src),
      x,
      y,
      scale: 1,
      scaleMax: 50,
      count: 100,
      countMin: 1,
      velocity: { x: 0, y: 0 },
      update,
      draw: function draw(context) {
        context.drawImage(
          this.image,
          this.x - (this.image.width * this.scale - this.image.width) / 2,
          this.y - (this.image.height * this.scale - this.image.height) / 2,
          this.image.width * this.scale,
          this.image.height * this.scale
        );
      },
      valid: function valid() {
        return this.scale < this.scaleMax && this.count > this.countMin;
      },
    };
  }

  function createEffect(element, configs, reference) {
    let scale = 1;
    let scaleMax = 50;
    let count = 100;
    let countMin = 1;

    return {
      update: (element) => {
        float(element);
      },
      complete: () => {
        return false;
      },
    };
  }

  // Effect functions

  function trail(element, cursor) {
    let difference = vecSubtract(cursor, element);
    element.velocity.x += difference.x * 0.1;
    element.velocity.y += difference.y * 0.1;
    element.velocity.x *= 0.9;
    element.velocity.y *= 0.9;

    element.x += element.velocity.x;
    element.y += element.velocity.y;
  }

  function float(element) {
    element.y--;
  }

  function scale(element, percentage) {
    element.scale *= percentage;
    element.x = element.x;
    console.log(
      (element.image.width * element.scale - element.image.width) / 2
    );
  }

  // Main

  function cursr(conifgs) {
    let display = createDisplay();
    cursorSet(conifgs.img);

    function follow(configs, reference = display.cursor) {
      let element = createElement(configs.img, reference.x, reference.y, () => {
        trail(element, display.cursor);
      });
      display.addElement(element);
      return element;
    }

    function spring(configs, reference = display.cursor) {
      let element = createElement(configs.img, reference.x, reference.y, () => {
        trail(element, display.cursor);
      });
      display.addElement(element);
      return element;
    }

    function spawn(configs, reference = display.cursor) {
      document.addEventListener("mousemove", async (e) => {
        let element = createElement(
          configs.img,
          reference.x,
          reference.y,
          () => {
            float(element);
            scale(element, 1.1);
          }
        );
        display.addElement(element);
        return element;
      });
    }

    function start() {
      function loop() {
        display.updateElements();
        display.drawElements();
        requestAnimationFrame(loop);
      }
      loop();
    }

    return { follow, spring, spawn, start };
  }

  return cursr;
})();
