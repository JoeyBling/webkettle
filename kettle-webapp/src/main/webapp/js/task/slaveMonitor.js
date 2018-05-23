//展示节点监控的面板
function showSlaveMonitorPanel(secondGuidePanel){
    var tBar=getTbarForSlaveMonitorPanel();
    var divHtml="<div id='main' style='height:450px;width:800px;display:inline-block;'></div>";

    var slaveMonitorPanel=new Ext.Panel({
        id:"slaveMonitorPanel",
        title:"<font size = '3px' >节点监控</font>",
        widht:820,
        html:divHtml,
        tbar:tBar
    });
    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(slaveMonitorPanel);
    secondGuidePanel.doLayout();
    refreshSlaveMonitorPanel(slaveMonitorPanel,"负载指数","平均值","");
}

//刷新节点监控面板的内容
function refreshSlaveMonitorPanel(slaveMonitorPanel,quatoTypeValue,maxOrAvg,chooseDate){
    Ext.Ajax.request({
        url:"/slave/slaveQuatoByCondition.do",
        success:function(response,config){
            var result=response.responseText;
            if(result==undefined || result==""){
                Ext.get("main").dom.innerHTML="当前暂无可用节点";
            }else{
                var resultJson=Ext.decode(result);
                showSlaveOneQuato(resultJson);
            }
        },
        failure:failureResponse,
        params:{quatoTypeValue:quatoTypeValue,maxOrAvg:maxOrAvg,chooseDate:chooseDate}
    });
}

function showSlaveOneQuato(result){
    var myChart = echarts.init(document.getElementById('main'));
    option1 = {
        title: {
            text: '负载情况'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:result.legend
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis:result.X,
        yAxis:result.Y,
        series: result.series
    };
    myChart.setOption(option1);
}

//生成节点监控模块所需要的顶部控件
function getTbarForSlaveMonitorPanel(){
    var quatoTypeCombobox=getSlaveQuatoType();
    quatoTypeCombobox.setValue("负载指数");
    var calcCombobox=calcTypeCombobox();
    calcCombobox.setValue("平均值");
    var dateField=new Ext.form.DateField({
        id:"createDate",
        name: "createDate",
        fieldLabel: "创建日期",
        width: 100,
        format: "Y-m-d",
        emptyText:"选择日期"
    })
    var toolBar=new Ext.Toolbar({
        buttons:[
            quatoTypeCombobox,"-",calcCombobox,"-",dateField,"-",
            {
                iconCls:"searchCls",
                tooltip: '查询',
                handler:function(){
                    var quatoType=Ext.getCmp("slaveQuatoCombobox").getValue();
                    var avgOrMax=Ext.getCmp("calcCombobox").getValue();
                    var chooseDate=Ext.getCmp("createDate").getValue();
                    var slaveMonitorPanel=Ext.getCmp("slaveMonitorPanel");
                    refreshSlaveMonitorPanel(slaveMonitorPanel,quatoType,avgOrMax,chooseDate);
                }
            }
        ]
    });
    return toolBar;
}

//生成节点指标中 所有指标属性组成的下拉列表
function getSlaveQuatoType(){
    var slaveQuatoType=[
        ["负载指数","负载指数"],
        ["CPU利用率","CPU利用率"],
        ["空闲内存","空闲内存"],
        ["空闲硬盘","空闲硬盘"],
        ["线程数","线程数"],
        ["转换数","转换数"],
        ["作业数","作业数"]
    ];
    var proxy=new Ext.data.MemoryProxy(slaveQuatoType);
    var reader=new Ext.data.ArrayReader({},[
        {name:"typeId",type:"string",mapping:0},
        {name:"typeName",type:"string",mapping:1}
    ]);
    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        autoLoad:true
    });
    var slaveQuatoTypeCombobox=new Ext.form.ComboBox({
        id:"slaveQuatoCombobox",
        triggerAction:"all",
        store:store,
        displayField:"typeName",
        valueField:"typeId",
        mode:"local",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                //获取被选中的节点指标项
                var typeId=slaveQuatoTypeCombobox.getValue();
                var maxOrAvg=Ext.getCmp("calcCombobox").getValue();
                var slaveMonitorPanel=Ext.getCmp("slaveMonitorPanel");
                var chooseDate=Ext.getCmp("createDate").getValue();
                refreshSlaveMonitorPanel(slaveMonitorPanel,typeId,maxOrAvg,chooseDate);
            }
        }
    });
    return slaveQuatoTypeCombobox;
}

//平均值和最大值的下拉框
function calcTypeCombobox(){
    var calcType=[
        ["平均值","平均值"],
        ["最大值","最大值"]
    ];
    var proxy=new Ext.data.MemoryProxy(calcType);
    var reader=new Ext.data.ArrayReader({},[
        {name:"typeId",type:"string",mapping:0},
        {name:"typeName",type:"string",mapping:1}
    ]);
    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        autoLoad:true
    });
    var calcCombobox=new Ext.form.ComboBox({
        id:"calcCombobox",
        triggerAction:"all",
        store:store,
        displayField:"typeName",
        valueField:"typeId",
        mode:"local",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                //获取被选中的节点指标项
                var maxOrAvg=calcCombobox.getValue();
                var typeId=Ext.getCmp("slaveQuatoCombobox").getValue();
                var slaveMonitorPanel=Ext.getCmp("slaveMonitorPanel");
                var chooseDate=Ext.getCmp("createDate").getValue();
                refreshSlaveMonitorPanel(slaveMonitorPanel,typeId,maxOrAvg,chooseDate);
            }
        }
    });
    return calcCombobox;
}
