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
            for (var i = 0; i < dataArray[1].length; i++) {
                html += "<br><a  class='glyphicon glyphicon-file' href=" + dataArray[1][i].filename + '>' + dataArray[1][i].filename + '</a></br>';
            }
            html += '</div>';
            console.log(html);
            $('#fc').html(html);
        }
    });
}