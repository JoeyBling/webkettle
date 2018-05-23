function generateSchedulerMonitorPanel(secondGuidePanel){
    var sm=new Ext.grid.CheckboxSelectionModel();
    //定时作业列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm,
        {header:"定时id",dataIndex:"idJobtask",align:"center"},
        {header:"作业名",dataIndex:"jobName",align:"center"},
        {header:"执行节点",dataIndex:"hostName",align:"center"},
        {header:"周期",dataIndex:"timerInfo",align:"center"},
        {header:"操作",dataIndex:"",menuDisabled:true,align:"center",
            renderer:function(v){
                if(loginUserTaskGroupPower==1 || loginUserName=="admin"){
                    return "<img src='../../ui/images/i_delete.png' class='imgCls' onclick='deleteSchedueler()' title='删除定时'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_editor.png' class='imgCls' onclick='updateScheduler()' title='修改定时'/>";
                }else{
                    return "";
                }
            }
        }
    ]);
    //proxy从后台获取数据
    var proxy=new Ext.data.HttpProxy({url:"/scheduler/getAllJobScheduler.do"});

    //Record定义记录结果
    var jobSchedulerRecord=Ext.data.Record.create([
        {name:"idJobtask",type:"string",mapping:"idJobtask"},
        {name:"jobName",type:"string",mapping:"jobName"},
        {name:"hostName",type:"string",mapping:"hostName"},
        {name:"timerInfo",type:"string",mapping:"timerInfo"},
    ])
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},jobSchedulerRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        listeners: {
            "beforeload": function(store) {
                var typeId="";
                var hostName="";
                var jobName="";
                if(Ext.getCmp("typeChooseBySelect")!=undefined){
                    typeId=Ext.getCmp("typeChooseBySelect").getValue();
                }
                if(Ext.getCmp("hostNameId")!=undefined){
                    hostName=Ext.getCmp("hostNameId").getValue();
                }
                if(Ext.getCmp("inputJobName")!=undefined){
                    jobName=Ext.getCmp("inputJobName").getValue();
                }
                store.baseParams = {
                    typeId:typeId,
                    hostName:hostName,
                    jobName:jobName
                }
            }
        }
    })
    store.load({params:{start:0,limit:15}});
    var inputTypeId="";
    var inputHostName="";
    var inputJobName="";
    if(Ext.getCmp("typeChooseBySelect")!=undefined){
        inputTypeId=Ext.getCmp("typeChooseBySelect").getValue();
    }
    if(Ext.getCmp("hostNameId")!=undefined){
        inputHostName=Ext.getCmp("hostNameId").getValue();
    }
    if(Ext.getCmp("inputJobName")!=undefined){
        inputJobName=Ext.getCmp("inputJobName").getValue();
    }

    var typeSelect=generateSchedulerTypeSelect(inputTypeId);
    var hostNameSelect=generateSlaveHostNameSelect(inputHostName);
    var JobNameField=new Ext.form.TextField({
        id:"inputJobName",
        width: 150,
        value:inputJobName ,
        emptyText:"任务名"

    })

    var jobSchedulerGrid=new Ext.grid.GridPanel({
        id:"schedulergrid",
        title:"<font size = '3px' >定时调度</font>",
        width:1000,
        height:600,
        cm:cm,      //列模型
        sm:sm,
        store:store,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        closable:true,
        tbar:new Ext.Toolbar({
            buttons:[
                typeSelect,"-",hostNameSelect,"-",JobNameField,
                {
                    iconCls:"searchCls",
                    tooltip: '查询',
                    handler:function(){
                        generateSchedulerMonitorPanel(secondGuidePanel);
                    }
                }
            ]
        }),
        bbar:new Ext.PagingToolbar({
            cls: "bgColorCls",
            store:store,
            pageSize:15,
            displayInfo:true,
            displayMsg:"本页显示第{0}条到第{1}条的记录,一共{2}条",
            emptyMsg:"没有记录"
        })
    })
    jobSchedulerGrid.getColumnModel().setHidden(2,true);
    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(jobSchedulerGrid);
    secondGuidePanel.doLayout();
    if(loginUserTaskGroupPower!=1 && loginUserName!="admin"){
        Ext.getCmp("updateSchedulerButton").hide();
        Ext.getCmp("deleteSchedulerButton").hide();
    }
}

//生成定时类型的下拉列表
function generateSchedulerTypeSelect(typeId){
    //下拉列表智能执行的数据来源  暂时支持4种定时
    var schedulerType=[
        ["间隔重复","间隔重复"],
        ["每天执行","每天执行"],
        ["每周执行","每周执行"],
        ["每月执行","每月执行"]
    ]
    var schedulerTypeProxy=new Ext.data.MemoryProxy(schedulerType);

    //下拉列表的数据结构
    var schedulerTypeRecord=Ext.data.Record.create([
        {name:"typeId",type:"string",mapping:0},
        {name:"typeInfo",type:"string",mapping:1}
    ])
    var reader=new Ext.data.ArrayReader({},schedulerTypeRecord);

    var store=new Ext.data.Store({
        proxy:schedulerTypeProxy,
        reader:reader,
        autoLoad:true
    });
    typeChooseCom=new Ext.form.ComboBox({
        id:"typeChooseBySelect",
        triggerAction:"all",
        store:store,
        displayField:"typeInfo",
        valueField:"typeId",
        mode:"local",
        autoLoad:true,
        emptyText:"执行类型",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                //获取当前执行类型被选中的Id    转换成对应的type数值
                var typeId=Ext.getCmp("typeChooseBySelect").getValue();
                //获取节点IP下拉列表被选中的值
                var hostName=Ext.getCmp("hostNameId").getValue();
                //获取作业名框输入的值
                var jobName=Ext.getCmp("inputJobName").getValue();

                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                generateSchedulerMonitorPanel(secondGuidePanel);
            }
        }
    })
    if(typeId!=undefined && typeId!=""){
        if(typeId=="1"){
            typeChooseCom.setValue("间隔重复");
        }else if(typeId=="2"){
            typeChooseCom.setValue("每天执行");
        }else if(typeId=="3"){
            typeChooseCom.setValue("每周执行");
        }else if(typeId=="4"){
            typeChooseCom.setValue("每月执行");
        }

    }
    return typeChooseCom;

}

//生成节点ip的下拉列表
function generateSlaveHostNameSelect(hostNameValue){
    var proxy=new Ext.data.HttpProxy({url:"/slave/getSlaveSelect.do"});

    var hostName=Ext.data.Record.create([
        {name:"hostId",type:"String",mapping:"hostId"},
        {name:"hostName",type:"String",mapping:"hostName"},
    ]);

    var reader=new Ext.data.JsonReader({},hostName);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    });

    hostNameCom=new Ext.form.ComboBox({
        id:"hostNameId",
        triggerAction:"all",
        store:store,
        displayField:"hostName",
        valueField:"hostId",
        mode:"remote",
        emptyText:"节点选择",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                generateSchedulerMonitorPanel(secondGuidePanel);
            }
        }
    })
    if(hostNameValue!=undefined && hostNameValue!=""){
        hostNameCom.setValue(hostNameValue);
    }

    return hostNameCom;
}

//删除定时
function deleteSchedueler(){
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    var jobSchedulerGrid=Ext.getCmp("schedulergrid");
    var view=jobSchedulerGrid.getView();
    //获得行选择模型
    var rsm=jobSchedulerGrid.getSelectionModel();
    //定义存放所选的定时作业的id
    var taskIdArray=new Array();
    for(var i=0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            taskIdArray.push(jobSchedulerGrid.getStore().getAt(i).get("idJobtask"));
        }
    }
    if(taskIdArray.length>0){
        Ext.MessageBox.confirm("确认","确认删除所选中记录?",function(btn){
            if(btn=="yes"){
                Ext.Ajax.request({
                    url:"/scheduler/deleteScheduler.do",
                    success:function(response,config){
                        generateSchedulerMonitorPanel(secondGuidePanel);
                        Ext.MessageBox.alert("提示","移除定时作业成功~!");
                    },
                    failure:failureResponse,
                    params:{taskIdArray:taskIdArray}
                })
            }else{
                return;
            }
        })
    }else{
        Ext.MessageBox.alert("提示","请先选需要一或多行需要移除的定时任务!")
    }
}

//修改定时
function updateScheduler(){
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    var jobSchedulerGrid=Ext.getCmp("schedulergrid");
    var view=jobSchedulerGrid.getView();
    //获得行选择模型
    var rsm=jobSchedulerGrid.getSelectionModel();
    //获取所需要修改的定时作业id
    var taskIdArray=new Array();
    for(var i=0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            taskIdArray.push(jobSchedulerGrid.getStore().getAt(i).get("idJobtask"));
        }
    }
    if(taskIdArray.length<1){
        Ext.MessageBox.alert("请选中一行需要修改的数据");
        return;
    }else if(taskIdArray.length>1){
        Ext.MessageBox.alert("只能选中一行数据进行修改");
        return;
    }else{
        Ext.Ajax.request({
            url:"/scheduler/beforeUpdateScheduler.do",
            success:function(response,config){
                var results=Ext.util.JSON.decode(response.responseText);
                //生成修改的弹窗
                var formElementArray=new Array();
                //根据用户需要修改的定时任务类型生成表单 并且填充修改前的值
                var typeChooseCombox=Ext.getCmp("typeChoose");
                if(results.schedulertype==1){
                    formElementArray.push(IntevalMinuteTextField());
                }else if(results.schedulertype==2){
                    formElementArray.push(MinuteTextField());
                    formElementArray.push(HourTextField());
                }else if(results.schedulertype==3){
                    formElementArray.push(MinuteTextField());
                    formElementArray.push(HourTextField());
                    formElementArray.push(generateDayChooseByWeek());
                }else{
                    formElementArray.push(MinuteTextField());
                    formElementArray.push(HourTextField());
                    formElementArray.push(generateDayChooseByMonth());
                }
                var thisWindow=fixedExecuteWindow("修改",formElementArray,"/scheduler/updateJobScheduler.do");
                thisWindow.show(jobSchedulerGrid);
                //给表单中填入用户修改前的数值
                switch(results.schedulertype)
                {
                    case 1:
                        Ext.getCmp("intervalminute").setValue(results.intervalminutes);
                        Ext.getCmp("typeChoose").setValue("间隔重复");
                        break;
                    case 2:
                        Ext.getCmp("minuteField").setValue(results.minutes);
                        Ext.getCmp("hourField").setValue(results.hour);
                        Ext.getCmp("typeChoose").setValue("每天执行");
                        break;
                    case 3:
                        Ext.getCmp("minuteField").setValue(results.minutes);
                        Ext.getCmp("hourField").setValue(results.hour);
                        var weekdayValue="";
                        if(results.weekday==1){
                            weekdayValue="周日";
                        }else if(results.weekday==2){
                            weekdayValue="周一";
                        }else if(results.weekday==3){
                            weekdayValue="周二";
                        }else if(results.weekday==4){
                            weekdayValue="周三";
                        }else if(results.weekday==5){
                            weekdayValue="周四";
                        }else if(results.weekday==6){
                            weekdayValue="周五";
                        }else if(results.weekday==7){
                            weekdayValue="周六";
                        }
                        Ext.getCmp("weekChoose").setValue(weekdayValue);
                        Ext.getCmp("typeChoose").setValue("每周执行");
                        break;
                    case 4:
                        Ext.getCmp("minuteField").setValue(results.minutes);
                        Ext.getCmp("hourField").setValue(results.hour);
                        Ext.getCmp("monthChoose").setValue(results.dayofmonth+"号");
                        Ext.getCmp("typeChoose").setValue("每月执行");
                        break;
                    default:
                        return;
                }
            },
            params:{taskId:taskIdArray[0]}
        })
    }
}


