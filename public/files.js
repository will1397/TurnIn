function showFiles(box) {
    $.ajax({
        url: '/getFiles',
        type: 'POST',
        data: {
            name: box
        },
        success: function(dataArray){
            var html = "<div class=\"well well-lg\"><h2>Files for " + box + "</h2>";
            html += "<h5>Filebox code: " + dataArray[0] + "</h5>";
            html += "<h5>Expiration Date: " + dataArray[1] + "</h5>";
            for (var i = 0; i < dataArray[2].length; i++) {
                html += "<br><a  class='glyphicon glyphicon-file' href=" + dataArray[2][i].filename + '>' + dataArray[2][i].filename + '</a></br>';
            }
            html += '</div>';
            console.log(html);
            $('#fc').html(html);
        }
    });
}