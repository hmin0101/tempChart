$(document).ready(function() {

    // Chart
    const tempChart = echarts.init(document.getElementById("chart-temp"));
    const option = {
        toolbox: {
            show: false,
            feature: {
                saveAsImage: {
                    type: "png",
                    backgroundColor: "#fff",
                }
            }
        },
        tooltip : {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                label: {
                    show: true
                }
            }
        },
        legend: {},
        xAxis: [{
            type: "time",
        }],
        yAxis: [{
            type: "value",
            name: "Temp",
        }, {
            type: "value",
            name: "Humidity",
        }],
        series: [{
            name: 'temp',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: [5, 20, 36, 10, 10, 20]
        },{
            name: 'rh',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: []
        },{
            name: 'dew',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: []
        }],
        dataZoom: [{
            start: 0,
            end: 100
        }, {
            start: 0,
            end: 100,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }
        }],
    };
    tempChart.setOption(option);

    // FooTable
    const ft = FooTable.init('#table-data', {
        columns: [
            {name: "index", title: "", classes: "hidden"},
            {name: "date", title: "Date", type: "string"},
            {name: "temp", title: "Temp(°C)", type: "number"},
            {name: "rh", title: "RH(%rh)", type: "number"},
            {name: "dew", title: "DewPoint(°C)", type: "number"},
        ]
    });

    // Select Upload File
    const uploadButton = document.getElementById("btn-upload");
    uploadButton.addEventListener("click", function() {
        document.getElementById("input-upload").click();
    });

    // Upload Event
    document.getElementById("input-upload").addEventListener("change", function() {
        const file = this.files[0];
        upload(file, ft, tempChart, option)
    });

    // Click Row Event
    let currentIndex = 0;
    $(document).on("click", "#table-data > tbody > tr > td", function() {
        const row = FooTable.getRow(this).value;
        currentIndex = row.index;

        $('#input-t').val(row.temp);
        $('#input-h').val(row.rh);
        $('#input-d').val(row.dew);

        $('#modal-edit').modal("show");
    });

    // Save Button Event
    $('#modal-edit #btn-save').on("click", function() {
        if (currentIndex !== 0) {
            const data = {
                index: currentIndex,
                temp: $('#input-t').val(),
                rh: $('#input-h').val(),
                dew: $('#input-d').val()
            };
            edit(data, ft, tempChart, option);
            currentIndex = 0;

            $('#modal-edit').modal("hide");
        }
    });

    // Download Chart Image
    document.getElementById("btn-download").addEventListener("click", function() {
        let dataURL = tempChart.getDataURL({backgroundColor: "#fff"});
        dataURL = dataURL.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

        const aTag = document.createElement('a');
        aTag.download = 'comprehensive_graph.png';
        aTag.href = dataURL;
        aTag.click();
    });

    // Confirm Password
    document.getElementById("btn-confirm").addEventListener("click", function() {
        const currentPassword = $('#input-pw').val();
        const result = confirm(currentPassword);
        if (result) {
            $('.cover').addClass("hidden");
            $('#modal-encrypt').modal("hide");
        } else {
            $('#modal-encrypt .warning-message').text("Not Match Password");
            $('#modal-encrypt .warning-message').removeClass("hidden");
        }
    });

    // Init
    $('#modal-encrypt').modal("show");

});