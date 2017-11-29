$('.upload-btn').on('click', function (){
    $('#upload-input').click();

    var element= document.getElementById("message");
    element.style.display = "none";
});

$('#upload-input').on('change', function(){

    var files = $(this).get(0).files;

    if (files.length > 0){
        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            var str = file.name;
            if (str.indexOf(' ') >= 0) {
                var html = "<h5>No Spaces Allowed In File Names</h5>";
                $('#message').html(html);

                var element= document.getElementById("message");
                element.style.display = "block";
                return;
            }

            formData.append('uploads[]', file, file.name);
        }

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data){
                var html = "<h5>File(s) Successfully Uploaded</h5>";
                $('#message').html(html);

                var element= document.getElementById("message");
                element.style.display = "block";
            }
        });

    }
});