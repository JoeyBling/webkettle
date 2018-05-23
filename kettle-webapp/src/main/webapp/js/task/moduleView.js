var moduleViewInterval="";

function showModuleView(secondGuidePanel){
    secondGuidePanel.removeAll(true);
    var windowHTML="<div id='moduleTitle' style='height:50px; margin-bottom:5px;position:relative;'><span style='position:absolute;left:430px;top:10px;font-size:32px;color:#2f9adb'>平台概况视图</span></div>"+
        "<div style='height:330px;display:inline-block;position:relative;'><div id='module1' style='height:300px;width:250px;display:inline-block;border-right:1px dashed #2f9adb;'></div><div style='position:absolute;top:230px;left:70px;'>运行中作业数</div></div>"+
        "<div style='height:330px;display:inline-block;position:relative;'><div id='module2' style='height:300px;width:250px;display:inline-block;border-right:1px dashed #2f9adb'></div><div style='position:absolute;top:230px;left:70px;'>运行中转换数</div></div>"+
        "<div style='height:330px;display:inline-block;position:relative;'><div id='module3' style='height:300px;width:250px;display:inline-block;border-right:1px dashed #2f9adb'></div><div style='position:absolute;top:230px;left:100px;'>节点数</div></div>"+
        "<div style='height:330px;display:inline-block;position:relative;'><div id='module4' style='height:300px;width:250px;display:inline-block;'></div><div style='position:absolute;top:230px;left:80px;'>定时作业数</div></div>";
    var viewModulePanel=new Ext.Panel({
        title:"<font size = '3px' >平台概况</font>",
        width:1100,
        html:windowHTML,
        autoScroll: true
    });
    secondGuidePanel.add(viewModulePanel);
    secondGuidePanel.doLayout();
    if(document.getElementById('module1')){
        moduleViewData();
    }

}

function moduleViewData(){
    var option1 = {
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            {
                type: 'gauge',
                detail: {formatter:'{value}'},
                data: [{value: 50, name: '运行中作业数'}]
            }
        ]
    };
    var option2 = {
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            {
                type: 'gauge',
                detail: {formatter:'{value}'},
                data: [{value: 50, name: '运行中转换数'}]
            }
        ]
    };
    var option3 = {
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            {
                type: 'gauge',
                detail: {formatter:'{value}'},
                data: [{value: 50, name: '定时作业数'}]
            }
        ]
    };
    var option4 = {
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            {
                type: 'gauge',
                detail: {formatter:'{value}'},
                data: [{value: 50, name: '节点数'}]
            }
        ]
    };
    var myChart1 = echarts.init(document.getElementById('module1'));
    var myChart2 = echarts.init(document.getElementById('module2'));
    var myChart3 = echarts.init(document.getElementById('module3'));
    var myChart4 = echarts.init(document.getElementById('module4'));
    Ext.Ajax.request({
        url:"/viewModule/getData.do",
        success:function(response,config){
            var result=Ext.decode(response.responseText);
            option1.series[0].data[0] =result.runningJob;
            option2.series[0].data[0] =result.runningTrans;
            option3.series[0].data[0] =result.slave;
            option4.series[0].data[0] =result.scheduler;

            myChart1.setOption(option1, true);
            myChart2.setOption(option2, true);
            myChart3.setOption(option3, true);
            myChart4.setOption(option4, true);
        },
        failure:failureResponse,
        params:{}
    });
   moduleViewInterval=setInterval(function () {
        Ext.Ajax.request({
            url:"/viewModule/getData.do",
            success:function(response,config){
                var result=Ext.decode(response.responseText);
                option1.series[0].data[0] =result.runningJob;
                option2.series[0].data[0] =result.runningTrans;
                option3.series[0].data[0] =result.slave;
                option4.series[0].data[0] =result.scheduler;

                myChart1.setOption(option1, true);
                myChart2.setOption(option2, true);
                myChart3.setOption(option3, true);
                myChart4.setOption(option4, true);
            },
            failure:failureResponse,
            params:{}
        });
    },50000);
}