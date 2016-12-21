(function () {
    $('canvas.query').on('mousedown', function (e) {
        e.preventDefault();
        if (this.getContext('2d')) {
            var context = this.getContext('2d');
            var x = Math.floor(event.offsetX / 10) * 10;
            var y = Math.floor(event.offsetY / 10) * 10;

            context.fillRect(x, y, 10, 10);
        }

        $(this).on('mousemove', function (event) {
            if (this.getContext('2d')) {
                var context = this.getContext('2d');
                var x = Math.floor(event.offsetX / 10) * 10;
                var y = Math.floor(event.offsetY / 10) * 10;

                context.fillRect(x, y, 10, 10);
            }
        });
    });


    $('canvas.query').on('contextmenu', function (e) {
        e.preventDefault();

        $(this).on('mousemove', function (event) {
            if (this.getContext('2d')) {
                var context = this.getContext('2d');
                var x = event.offsetX;
                var y = event.offsetY;

                context.clearRect(x - 10, y - 10, 20, 20);
            }
        });
    });

    $(document).on('mouseup', function () {
        $('canvas.query').off('mousemove');
    });


    $('.add-image').on('click', function () {
        var canvas = $('canvas.query')[0],
            imageData = canvas.getContext('2d').getImageData(0, 0, 100, 100),
            data = imageData.data;

        var binaryData = [];

        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                data = canvas.getContext('2d').getImageData(j * 10, i * 10, 10, 10).data;
                binaryData.push(data[3] == 0 ? -1 : 1);
            }
        }

        binaryData = binaryData.join('');

        $.ajax({
            type: "POST",
            url: "/add_block",
            data: {data: binaryData},
            success: function () {
                var added_images = $('.added-images');

                var images = added_images.prepend('<canvas width="100px" height="100px" class="added-image"></canvas>'),
                    context = images.children().first()[0].getContext('2d');

                context.putImageData(imageData, 0, 0);
            }
        });
    });

    $('.recognize-image').on('click', function () {
        var canvas_query = !$('canvas.query')[0].dataset.async ? $('canvas.query')[0] : $('canvas.answer')[0],
            imageData = canvas_query.getContext('2d').getImageData(0, 0, 100, 100),
            data = imageData.data;

        var binaryData = [];

        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                data = canvas_query.getContext('2d').getImageData(j * 10, i * 10, 10, 10).data;
                binaryData.push(data[3] == 0 ? -1 : 1);
            }
        }

        binaryData = binaryData.join('');

        $.ajax({
            type: "POST",
            url: "/recognize",
            data: {data: binaryData},
            success: function (responce) {
                var data = (JSON.parse(responce).data.match(/-*\d/g)).reverse(),
                    canvas = $('canvas.answer')[0],
                    context = canvas.getContext('2d');

                canvas_query.dataset.async = JSON.parse(responce).async;

                context.putImageData(new ImageData(new Uint8ClampedArray(new Array(40000).fill(0)), 100, 100), 0, 0);

                for (var i = 0; i < 10; i++) {
                    for (var j = 0; j < 10; j++) {
                        var pixel = [0, 0, 0, data.pop() == -1 ? 0 : 255];

                        var newData = [];

                        for (var k = 0; k < 100; k++) {
                            newData = newData.concat(pixel);
                        }

                        var imageData = new ImageData(new Uint8ClampedArray(newData), 10, 10);
                        context.putImageData(imageData, j * 10, i * 10);
                    }
                }
            }
        });

    });

})();