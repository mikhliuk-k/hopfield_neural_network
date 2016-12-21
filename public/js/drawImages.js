(function () {
    var images = $('.added-images .added-image');

    images.each(function () {
        var self = this;

        $.ajax({
            url: '/get_image_data',
            type: 'POST',
            data: {id: this.dataset.id},
            success: function (responce) {
                var data = (JSON.parse(responce).data.match(/-*\d/g)).reverse(),
                    context = self.getContext('2d');

                for (var i = 0; i < 10; i++) {
                    for (var j = 0; j < 10; j++) {
                        var pixel = [0, 0, 0, data.pop() == -1 ? 0 : 255],
                            newData = [];

                        for (var k = 0; k < 100; k++) {
                            newData = newData.concat(pixel);
                        }

                        var imageData = new ImageData(new Uint8ClampedArray(newData), 10, 10);
                        context.putImageData(imageData, j * 10, i * 10);
                    }
                }
            }
        })
    })

})();