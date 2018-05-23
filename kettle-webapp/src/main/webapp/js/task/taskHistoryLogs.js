logSearch=function(statu,type,startDate,taskName){
    this.statu=statu;
    this.type=type;
    this.startDate=startDate;
    this.taskName=taskName;
}

function showHistoryLogPanel(secondGuidePanel){
    //列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        {header:"id",dataIndex:"fireId",align:"center"},
        {header:"任务名",dataIndex:"jobName",align:"center"},
        {header:"任务类型",dataIndex:"type",align:"center"},
        {header:"开始时间",dataIndex:"startTime",format:"y-M-d H:m:s",align:"center"},
        {header:"结束时间",dataIndex:"endTime",format:"y-M-d H:m:s",align:"center"},
        {header:"执行方式",dataIndex:"execMethod",align:"center"},
        {header:"状态",dataIndex:"status",align:"center"},
        {header:"参数信息",dataIndex:"executionConfiguration",align:"center",
            renderer:function(v){
                return "<img src='../../ui/images/i_detail.png' class='imgCls' onclick='showConfigInfo()' title='详细信息'/>&nbsp;&nbsp;";
            }
        },
        {header:"日志详情",dataIndex:"executionLog",align:"center",
            renderer:function(v){
                return "<img src='../../ui/images/i_detail.png' class='imgCls' onclick='showLogInfo()' title='详细信息'/>&nbsp;&nbsp;";
            }
        },

    ]);

    //准备数据 使用HttpProxy方式从后台获取json格式的数据
    var proxy=new Ext.data.HttpProxy({url:"/log/getAllHistoryLog.do"});

    //Record定义记录结果
    var human=Ext.data.Record.create([
        {name:"fireId",type:"string",mapping:"fireId"},
        {name:"jobName",type:"string",mapping:"jobName"},
        {name:"type",type:"string",mapping:"type"},
        {name:"startTime",type:"string",mapping:"startTime"},
        {name:"endTime",type:"string",mapping:"endTime"},
        {name:"execMethod",type:"string",mapping:"execMethod"},
        {name:"status",type:"string",mapping:"status"},
        {name:"executionConfiguration",type:"string",mapping:"executionConfiguration"},
        {name:"executionLog",type:"string",mapping:"executionLog"}
    ])
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},human);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        listeners: {
            "beforeload": function(store) {
                store.baseParams = {
                    search:JSON.stringify(getSearchParam())
                }
            }
        }
    });
    store.load({params:{start:0,limit:10}});

    var search=getSearchParam();
    var logTbar=getTbarForHistoryLog(search.statu,search.type,search.taskName);
    var grid=new Ext.grid.GridPanel({
        id:"historyLogPanel",
        title:"<font size = '3px' >历史日志</font>",
        height:470,
        cm:cm,      //列模型
        store:store,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        closable:true,
        tbar:logTbar,
        bbar:new Ext.PagingToolbar({
            cls: "bgColorCls",
            store:store,
            pageSize:10,
            displayInfo:true,
            displayMsg:"本页显示第{0}条到第{1}条的记录,一共{2}条",
            emptyMsg:"没有记录"
        })
    });
    grid.getColumnModel().setHidden(1,true);
    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(grid);
    secondGuidePanel.doLayout();
}

function showLogInfo(){
    var historyLogPanel=Ext.getCmp("historyLogPanel");
    var id=historyLogPanel.getSelectionModel().getSelected().get("fireId");
    Ext.Ajax.request({
        url:"/log/getTraceById.do",
        success:function(response,config){
            var trace=Ext.decode(response.responseText);
            var executionLog=trace.executionLog;
            var status=trace.status;
            var windowHTML="";
            if(status!="系统调度失败" && status!="程序错误"){
                var logJSON=eval("("+executionLog+")");
                for(var item in logJSON){
                    if(item=="log"){
                        windowHTML+=item+":"+"<br/>"+logJSON[item]+"<br/><br/>";
                    }
                }
            }else{
                windowHTML+=executionLog;
            }
            var logDetailWindow=new Ext.Window({
                title:"日志详情",
                width:500,
                height:520,
                autoScroll: true,
                id:"logDetailWindow",
                html:windowHTML,
                bodyStyle:"background-color:white",
                modal:true
            });
            logDetailWindow.show(historyLogPanel);
        },
        failure:failureResponse,
        params:{id:id}
    });

}

function showConfigInfo(){
    var historyLogPanel=Ext.getCmp("historyLogPanel");
    var id=historyLogPanel.getSelectionModel().getSelected().get("fireId");
    Ext.Ajax.request({
        url:"/log/getTraceById.do",
        success:function(response,config){
            var trace=response.responseText;
            var executionConfiguration=Ext.decode(trace).executionConfiguration;
            var windowHTML="";
            if(null!=executionConfiguration && executionConfiguration!=""){
                var configJSON=eval("("+executionConfiguration+")");
                for(var item in configJSON){
                    if(item=="parameters" || item=="variables" || item=="arguments"){
                        var array=configJSON[item];
                        var twoInfo="";
                        for(var i=0;i<array.length;i++){
                            var attr=array[i];
                            for(var item2 in attr){
                                twoInfo+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+item2+":"+attr[item2]+"<br/>"
                            }
                        }
                        if(item=="parameters"){
                            windowHTML+="命名参数:"+"<br/>"+twoInfo+"<br/>";
                        }else if(item=="variables"){
                            windowHTML+="变量:"+"<br/>"+twoInfo+"<br/>";
                        }else if(item=="arguments"){
                            windowHTML+="位置参数:"+"<br/>"+twoInfo+"<br/>";
                        }
                    }else if(item=="safe_mode"){
                        windowHTML+="是否使用安全模式"+":"+"<br/>"+configJSON[item]+"<br/><br/>";
                    }else if(item=="log_level"){
                        windowHTML+="日志级别"+":"+"<br/>"+configJSON[item]+"<br/><br/>";
                    }else if(item=="group"){
                        var array=configJSON[item];
                        if(array=="暂未分配任务组"){
                            windowHTML+="所属任务组"+":"+"<br/>"+array+"<br/><br/>";
                        }else{
                            var twoInfo="";
                            for(var i=0;i<array.length;i++){
                                var attr=array[i];
                                twoInfo+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+(i+1)+":"+attr+"<br/>";
                            }
                            windowHTML+="所属任务组:"+"<br/>"+twoInfo+"<br/>";
                        }
                    }
                }
            }

            var configDetailWindow=new Ext.Window({
                title:"参数详情",
                width:500,
                height:520,
                autoScroll: true,
                id:"configDetailWindow",
                html:windowHTML,
                bodyStyle:"background-color:white",
                modal:true
            });
            configDetailWindow.show(historyLogPanel);
        },
        failure:failureResponse,
        params:{id:id}
    });


}

//日志列表顶部的控件 用作查询
function getTbarForHistoryLog(statu,type,taskName){
    var taskNameField=new Ext.form.TextField({
        id:"nameForLogSearch",
        fieldLabel: "任务名",
        width:120,
        value:taskName,
        emptyText:"请输入任务名"
    });
    var dateField=new Ext.form.DateField({
        id:"crtDateForLogSearch",
        fieldLabel: "开始时间",
        width:100,
        format: "Y-m-d",
        emptyText:"开始时间"
    });
    var searchButton=new Ext.Button({
        iconCls:"searchCls",
        tooltip: '查询',
        handler:function(){
            var secondGuidePanel=Ext.getCmp("secondGuidePanel");
            showHistoryLogPanel(secondGuidePanel);
        }
    });

    var logStatu=logStatuSelect();
    var taskType=taskTypeSelect();
    if(statu!=""){
        logStatu.setRawValue(statu);
        logStatu.setValue(statu);
    }

    if(type!=""){
        taskType.setRawValue(type);
        taskType.setValue(type);
    }

    var toolBar=new Ext.Toolbar({
        buttons:[
            logStatu,"-",taskType,"-",taskNameField,"-",dateField,"-",searchButton
        ]
    });
    return toolBar;
}

//状态下拉选择选择框
function logStatuSelect(){
    var logStatuData=[
        ["成功","成功"],
        ["失败","失败"],
        ["系统调度失败","系统调度失败"]
    ];
    var proxy=new Ext.data.MemoryProxy(logStatuData);
    var reader=new Ext.data.ArrayReader({},[
        {name:"statuId",type:"string",mapping:0},
        {name:"statuName",type:"string",mapping:1}
    ]);
    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        autoLoad:true
    });
    var logStatuCombobox=new Ext.form.ComboBox({
        id:"logStatuCombobox",
        triggerAction:"all",
        store:store,
        displayField:"statuName",
        valueField:"statuId",
        mode:"local",
        emptyText:"执行结果",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                showHistoryLogPanel(secondGuidePanel);
            }
        }
    });
    return logStatuCombobox;
}

//任务类型下拉选择框
function taskTypeSelect(){
    var taskTypeData=[
        ["job","job"],
        ["trans","trans"]
    ];
    var proxy=new Ext.data.MemoryProxy(taskTypeData);
    var reader=new Ext.data.ArrayReader({},[
        {name:"taksTypeId",type:"string",mapping:0},
        {name:"taskTypeName",type:"string",mapping:1}
    ]);
    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        autoLoad:true
    });
    var taskTypeCombobox=new Ext.form.ComboBox({
        id:"taskTypeCombobox",
        triggerAction:"all",
        store:store,
        displayField:"taskTypeName",
        valueField:"taksTypeId",
        emptyText:"任务类型",
        mode:"local",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                showHistoryLogPanel(secondGuidePanel);
            }
        }
    });
    return taskTypeCombobox;
}

//收集查询参数
function getSearchParam(){
    var statu="";
    var type="";
    var startDate="";
    var taskName="";
    if(Ext.getCmp("logStatuCombobox")!=undefined){
        statu=Ext.getCmp("logStatuCombobox").getValue();
    }
    if(Ext.getCmp("taskTypeCombobox")!=undefined){
        type=Ext.getCmp("taskTypeCombobox").getValue();
    }
    if(Ext.getCmp("crtDateForLogSearch")!=undefined){
        startDate=Ext.getCmp("crtDateForLogSearch").getValue();
    }
    if(Ext.getCmp("nameForLogSearch")!=undefined){
        taskName=Ext.getCmp("nameForLogSearch").getValue();
    }
    var entity=new logSearch(statu,type,startDate,taskName);
    return entity;
}