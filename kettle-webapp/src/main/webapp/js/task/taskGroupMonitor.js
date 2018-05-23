TaskEntity=function(taskId,type,taskPath,taskName){
    this.taskId=taskId;
    this.type=type;
    this.taskPath=taskPath;
    this.taskName=taskName;
}

//任务组管理主面板  展示所有任务组(当前登录用户可见的任务组)
function showTaskGroupPanel(secondGuidePanel){
    var sm2=new Ext.grid.CheckboxSelectionModel();
    //节点列模型
    var taskGroupModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"任务组ID",dataIndex:"taskGroupId",align:"center"},
        {header:"任务组名",dataIndex:"taskGroupName",align:"center"},
        {header:"任务组描述",dataIndex:"taskGroupDesc",align:"center"},
        {header:"创建时间",dataIndex:"createDate",format:"y-M-d H:m:s",align:"center"},
        {header:"操作",dataIndex:"",menuDisabled:true,align:"center",
            renderer:function(v){
                if(loginUserName=="admin" || loginUserTaskGroupPower==1){
                    return "<img src='../../ui/images/i_delete.png' class='imgCls' onclick='deleteTaskGroupAndAttributes()' title='删除任务组'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_editor.png' class='imgCls' onclick='beforeUpdateTaskGroup()' title='编辑'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_detail.png' class='imgCls' onclick='beforeSelectTaskGroupDetail()' title='任务组详情' id='taskGroupAttrImg'/>&nbsp;&nbsp;";
                }else{
                    return "<img src='../../ui/images/i_detail.png' class='imgCls' onclick='beforeSelectTaskGroupDetail()' title='任务组详情' id='taskGroupAttrImg'/>&nbsp;&nbsp;";
                }
            }
        }
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/taskGroup/AlltaskGroup.do"});

    var taskGroupRecord=Ext.data.Record.create([
        {name:"taskGroupId",type:"string",mapping:"taskGroupId"},
        {name:"taskGroupName",type:"string",mapping:"taskGroupName"},
        {name:"taskGroupDesc",type:"string",mapping:"taskGroupDesc"},
        {name:"createDate",type:"string",mapping:"createDate"}
    ])
    //totalProperty代表总条数 root代表当页的数据
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},taskGroupRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        listeners: {
            "beforeload": function(store) {
                var inputname="";
                var choosedate="";
                if(Ext.getCmp("taskGroupNameField"))
                    inputname=Ext.getCmp("taskGroupNameField").getValue();
                if(Ext.getCmp("createDateByTG"))
                    choosedate=Ext.getCmp("createDateByTG").getValue();
                store.baseParams = {
                    taskGroupName:inputname,
                    createDate:choosedate
                }
            }
        }
    })
    store.load({params:{start:0,limit:10}});

    var inputTaskGroupName="";
    if(Ext.getCmp("taskGroupNameField"))
        inputTaskGroupName=Ext.getCmp("taskGroupNameField").getValue();
    var chooseCreateDate="";
    if(Ext.getCmp("createDateByTG"))
        chooseCreateDate=Ext.getCmp("createDateByTG").getValue();
    //搜索条件
    var taskGroupNameField=new Ext.form.TextField({
        id:"taskGroupNameField",
        fieldLabel: "用户组名",
        width:120,
        value:inputTaskGroupName,
        emptyText:"请输入用户组名.."
    })
    var createDateByTG=new Ext.form.DateField({
        id: "createDateByTG",
        fieldLabel: "创建日期",
        width: 100,
        value:chooseCreateDate,
        format: "Y-m-d",
        emptyText:"创建时间"
    })
    var taskGroupPanel=new Ext.grid.GridPanel({
        id:"taskGroupPanel",
        title:"<font size = '3px' >任务组</font>",
        width:1200,
        height:600,
        cm:taskGroupModel,
        sm:sm2,
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        tbar:new Ext.Toolbar({
            buttons: [
                taskGroupNameField,"-",createDateByTG,
                {
                    iconCls:"searchCls",
                    tooltip: '查询',
                    handler:function(){
                       showTaskGroupPanel(secondGuidePanel);
                    }
                },"-",
                {
                    iconCls:"addCls",
                    tooltip: '添加任务组',
                    id:"addTaskGroupButton",
                    handler:function(){
                        var addTaskGroupWindow=Ext.getCmp("addTaskGroupWindow");
                        if(addTaskGroupWindow)
                            addTaskGroupWindow.show();
                        else
                            addWindowByInfo();
                    }
                }
            ]
        }),
        bbar:new Ext.PagingToolbar({
            cls: "bgColorCls",
            store:store,
            pageSize:10,
            displayInfo:true,
            displayMsg:"本页显示第{0}条到第{1}条的记录,一共{2}条",
            emptyMsg:"没有记录"
        })
    });
    taskGroupPanel.getColumnModel().setHidden(2,true);

    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(taskGroupPanel);
    secondGuidePanel.doLayout();
    if(loginUserTaskGroupPower!=1 && loginUserName!="admin"){
        Ext.getCmp("addTaskGroupButton").hide();
    }
}

//删除功能  删除任务组并且移除任务组中的所有任务
function deleteTaskGroupAndAttributes(){
    var taskGroupName=Ext.getCmp("taskGroupPanel").getSelectionModel().getSelected().get("taskGroupName");//被选中的任务路径
    //删除前先判断任务组前是否包含了任务
    Ext.Ajax.request({
        url:"/taskGroup/selectTaskGroup.do",
        success:function(response,config){
            var result=response.responseText;
            if(result=="[]"){
                //删除任务组
                Ext.Ajax.request({
                    url:"/taskGroup/deleteTaskGroup.do",
                    success:function(response,config){
                        Ext.MessageBox.alert("result","删除成功!");
                        showTaskGroupPanel(Ext.getCmp("secondGuidePanel"));
                    },
                    failure:failureResponse,
                    params:{name:taskGroupName}
                })
            }else{
                Ext.MessageBox.alert("该任务组下存在任务,请至任务组详情功能中移除!");
            }
        },
        failure:failureResponse,
        params:{taskGroupName:taskGroupName}
    })
}

//查看功能  查看前先获取唯一选中行的任务组名
function beforeSelectTaskGroupDetail(){
    var taskGroupPanel=Ext.getCmp("taskGroupPanel");
    var view=taskGroupPanel.getView();
    var rsm=taskGroupPanel.getSelectionModel();
    var flag=0;
    var taskGroupName="";
    for(var i=0;i<view.getRows().length;i++) {
        if(rsm.isSelected(i)){
            taskGroupName=taskGroupPanel.getStore().getAt(i).get("taskGroupName");
            flag++;
        }
    }
    if(flag!=1){
        Ext.MessageBox.alert("请选择需要查看的任务组(只能选中一条)");
        return;
    }else{
        showSelectTaskGroupWindow(taskGroupPanel,taskGroupName);
    }
}

//查看功能 弹出窗口用于展现某个任务组详情列表
function showSelectTaskGroupWindow(taskGroupPanel,taskGroupName){
    var taskGroupAttributesPanel=showSelectTaskGroupPanel(taskGroupName);
    var taskGroupAttributesWindow=new Ext.Window({
        id:"taskGroupAttributesWindow",
        title:taskGroupName,
        bodyStyle:"background-color:white",
        width:610,
        modal:true,
        height:520,
        items:[
            taskGroupAttributesPanel
        ]
    });
    taskGroupAttributesWindow.show(taskGroupPanel);
}

//查看功能 列表用于展现任务组详情(所包含的作业以及转换)
function showSelectTaskGroupPanel(taskGroupName){
    //节点列模型
    var taskGroupAttributesModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        {header:"任务ID",dataIndex:"taskId"},
        {header:"任务类型",dataIndex:"type"},
        {header:"任务名",dataIndex:"taskName"},
        {header:"任务全目录名",dataIndex:"taskPath"},
        {header:"操作",dataIndex:"",menuDisabled:true,align:"center",
            renderer:function(v){
                return "<img src='../../ui/images/i_assigned.png' class='imgCls' onclick='taskGroupForAss()' title='分配任务组'/>&nbsp;&nbsp;"
            }
        }
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/taskGroup/selectTaskGroup.do"});

    var taskGroupAttributesRecord=Ext.data.Record.create([
        {name:"taskId",type:"string",mapping:"taskId"},
        {name:"type",type:"string",mapping:"type"},
        {name:"taskName",type:"string",mapping:"taskName"},
        {name:"taskPath",type:"string",mapping:"taskPath"}
    ])
    //totalProperty代表总条数 root代表当页的数据
    var reader=new Ext.data.JsonReader({},taskGroupAttributesRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load({params:{taskGroupName:taskGroupName}});

    var taskGroupAttributesPanel=new Ext.grid.GridPanel({
        id:"taskGroupAttributesPanel",
        width:595,
        height:500,
        cm:taskGroupAttributesModel,
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        }
    });
    taskGroupAttributesPanel.getColumnModel().setHidden(1,true);
    return taskGroupAttributesPanel;
}

//修改功能  修改前
function beforeUpdateTaskGroup(){
    var taskGroupPanel=Ext.getCmp("taskGroupPanel");
    var view=taskGroupPanel.getView();
    var rsm=taskGroupPanel.getSelectionModel();
    var taskGroupName="";
    var taskGroupDesc="";
    var taskGroupId="";
    var flag=0;
    for(var i=0;i<view.getRows().length;i++) {
        if(rsm.isSelected(i)){
            taskGroupId=taskGroupPanel.getStore().getAt(i).get("taskGroupId");
            taskGroupName=taskGroupPanel.getStore().getAt(i).get("taskGroupName");
            taskGroupDesc=taskGroupPanel.getStore().getAt(i).get("taskGroupDesc");
            flag++;
        }
    }
    if(flag!=1){
        Ext.MessageBox.alert("请选择需要修改的任务组(只能选中一条)");
    }else{
        showUpdateWindow(taskGroupPanel,taskGroupId,taskGroupName,taskGroupDesc);
    }
}

//修改功能  展示修改界面的表单弹窗
function showUpdateWindow(taskGroupPanel,taskGroupId,taskGroupName,taskGroupDesc){
    //任务组名输入框
    var taskGroupNameField=new Ext.form.TextField({
        id:"taskGroupNameInput",
        name: "taskGroupNameInput",
        fieldLabel: "任务组名",
        width:150,
        value:taskGroupName
    });
    //任务组描述输入框
    var taskGroupDescField=new Ext.form.TextArea({
        id:"taskGroupDescInput",
        name: "taskGroupDescInput",
        fieldLabel: "任务组描述",
        width:300,
        height:100,
        value:taskGroupDesc
    });
    //表单
    var updateTaskGroupForm=new Ext.form.FormPanel({
        id:"updateTaskGroupForm",
        width:500,
        height:220,
        frame:true,
        modal:true,
        labelWidth:130,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:[taskGroupNameField,taskGroupDescField]
            }
        ]
    });
    var updateTaskGroupWindow=new Ext.Window({
        id:"updateTaskGroupWindow",
        title:"修改任务组",
        bodyStyle:"background-color:white",
        width:500,
        modal:true,
        height:220,
        items:[
            updateTaskGroupForm
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"修改",
                handler:function(){
                    var inputGroupName=taskGroupNameField.getValue();
                    var inputGroupDesc=taskGroupDescField.getValue();
                    if(inputGroupName==undefined || inputGroupName==""){
                        Ext.MessageBox.alert("任务组名不能为空!");
                        return;
                    }else{
                        Ext.Ajax.request({
                            url:"/taskGroup/decideGroupNameExist.do",
                            success:function(response,config){
                                if(response.responseText=="Y" && inputGroupName!=taskGroupName){
                                    Ext.MessageBox.alert("该任务组名已存在!");
                                    return;
                                }else{
                                    updateTaskGroup(taskGroupId,inputGroupName,inputGroupDesc,updateTaskGroupWindow);
                                }
                            },
                            failure:function(response){
                                updateTaskGroupWindow.close();
                                failureResponse(response);
                            },
                            params:{name:inputGroupName}
                        })
                    }
                }
            }
        ]})
    });
    updateTaskGroupWindow.show(taskGroupPanel);
}

//修改功能  访问后台进行修改
function updateTaskGroup(taskGroupId,inputGroupName,inputGroupDesc,updateTaskGroupWindow){
    Ext.Ajax.request({
        url:"/taskGroup/updateTaskGroup.do",
        success:function(response,config){
            Ext.MessageBox.alert("result","修改成功!");
            updateTaskGroupWindow.close();
            showTaskGroupPanel(Ext.getCmp("secondGuidePanel"));
        },
        failure:function(response){
            updateTaskGroupWindow.close();
            failureResponse(response);
        },
        params:{id:taskGroupId,name:inputGroupName,desc:inputGroupDesc}
    })
}

//新增功能  填写任务组名和任务组描述的窗口
function addWindowByInfo(){
    var taskGroupPanel=Ext.getCmp("taskGroupPanel");
    //任务组名输入框
   var taskGroupName=new Ext.form.TextField({
        name: "taskGroupNameInput",
        fieldLabel: "任务组名",
        width:150,
        value:""
    });
    //任务组描述输入框
    var taskGroupDesc=new Ext.form.TextArea({
        name: "taskGroupDescInput",
        fieldLabel: "任务组描述",
        width:300,
        height:100,
        value:""
    });
    //表单
    var addTaskGroupForm=new Ext.form.FormPanel({
        id:"addTaskGroupForm",
        width:500,
        height:220,
        frame:true,
        labelWidth:130,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:[taskGroupName,taskGroupDesc]
            }
        ]
    });
    var addTaskGroupWindow=new Ext.Window({
        id:"addTaskGroupWindow",
        title:"新增任务组",
        bodyStyle:"background-color:white",
        width:500,
        modal:true,
        height:220,
        items:[
            addTaskGroupForm
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"下一步",
                handler:function(){
                    var taskGroupNameValue=taskGroupName.getValue();
                    if(taskGroupNameValue==undefined || taskGroupNameValue==""){
                        Ext.MessageBox.alert("任务组名不能为空!");
                        return;
                    }else{
                        Ext.Ajax.request({
                            url:"/taskGroup/decideGroupNameExist.do",
                            success:function(response,config){
                                if(response.responseText=="Y"){
                                    Ext.MessageBox.alert("该任务组名已存在!");
                                }else{
                                    addTaskGroupWindow.hide();
                                    var chooseTaskWindow=Ext.getCmp("chooseTaskWindow");
                                    if(chooseTaskWindow){
                                        chooseTaskWindow.show();
                                    }else{
                                        chooseTaskByTaskGroup();
                                    }
                                }
                            },
                            failure:function(response){
                                addTaskGroupWindow.close();
                                failureResponse(response);
                            },
                            params:{name:taskGroupNameValue}
                        })
                    }
                }
            }
        ]})
    });
    addTaskGroupWindow.show(taskGroupPanel);

}

//新增功能  选择任务的窗口(需要加入到任务组中的任务)
function chooseTaskByTaskGroup(){
    var taskGroupPanel=Ext.getCmp("taskGroupPanel");
    //生成一个列表展现该用户下的所有作业和转换
    var allTaskPanel=showAllTaskForAdd();
    //普通管理员与admin的不同操作
    var t_bar="";
    if(loginUserName=="admin"){
        t_bar=new Ext.Toolbar({buttons:[
            {
                text:"下一步",
                handler:function(){
                    chooseTaskWindow.hide();
                    var chooseUserGroupWindow=Ext.getCmp("chooseUserGroupWindow");
                    if(chooseUserGroupWindow)
                        chooseUserGroupWindow.show();
                    else
                        chooseUserGroupByAdmin();
                }
            },"-",
            {
                text:"上一步",
                handler:function(){
                    chooseTaskWindow.hide();
                    var addTaskGroupWindow=Ext.getCmp("addTaskGroupWindow");
                    addTaskGroupWindow.show();
                }
            }
        ]})
    }else{
        t_bar=new Ext.Toolbar({buttons:[
            {
                text:"确认",
                handler:function(){
                    addTaskGroupEnd(1);
                }
            }
        ]})
    }
    var chooseTaskWindow=new Ext.Window({
        id:"chooseTaskWindow",
        title:"选择需要分配的任务",
        modal:true,
        bodyStyle:"background-color:white",
        width:600,
        height:520,
        items:[
            allTaskPanel
        ],
        tbar:t_bar
    });
    chooseTaskWindow.show(taskGroupPanel);
}

//新增功能 选择对该任务组可见的用户组(该功能只对于admin用户)
function chooseUserGroupByAdmin(){
    var all=allUserGroupPanel();
    var taskGroupPanel=Ext.getCmp("taskGroupPanel");
    var chooseUserGroupWindow=new Ext.Window({
        id:"chooseUserGroupWindow",
        title:"选择可见用户组",
        modal:true,
        bodyStyle:"background-color:white",
        width:400,
        height:480,
        items:[
            all
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"确认",
                handler:function(){
                    addTaskGroupEnd(0);
                }
            },"-",
            {
                text:"上一步",
                handler:function(){
                    chooseUserGroupWindow.hide();
                    var chooseTaskWindow=Ext.getCmp("chooseTaskWindow");
                    chooseTaskWindow.show();
                }
            }
        ]})
    });
    chooseUserGroupWindow.show(taskGroupPanel);
}

//展示该用户下所有的任务   作业和转换
function showAllTaskForAdd(){
    var sm2=new Ext.grid.CheckboxSelectionModel();
    //节点列模型
    var allTaskPanelModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"任务ID",dataIndex:"taskId"},
        {header:"任务类型",dataIndex:"type"},
        {header:"任务名",dataIndex:"taskName"},
        {header:"任务全目录名",dataIndex:"taskPath"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/taskGroup/getAllTaskBeforeAdd.do"});

    var allTaskRecord=Ext.data.Record.create([
        {name:"taskId",type:"string",mapping:"taskId"},
        {name:"type",type:"string",mapping:"type"},
        {name:"taskName",type:"string",mapping:"taskName"},
        {name:"taskPath",type:"string",mapping:"taskPath"}
    ])
    //totalProperty代表总条数 root代表当页的数据
    var reader=new Ext.data.JsonReader({},allTaskRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load();

    var allTaskPanelForAdd=new Ext.grid.GridPanel({
        id:"allTaskPanelForAdd",
        width:595,
        height:500,
        cm:allTaskPanelModel,
        sm:sm2,
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        }
    });
    return allTaskPanelForAdd;
}

//新增作业or转换前获取当前用户下的所有任务组
function getAllTaskGroupBeforeCreate(){
    var sm2=new Ext.grid.CheckboxSelectionModel();
    //节点列模型
    var taskGroupModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"任务组ID",dataIndex:"taskGroupId"},
        {header:"任务组名",dataIndex:"taskGroupName"},
        {header:"任务组描述",dataIndex:"taskGroupDesc"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/taskGroup/getAllTaskGroupBeforeCreate.do"});

    var taskGroupRecord=Ext.data.Record.create([
        {name:"taskGroupId",type:"string",mapping:"taskGroupId"},
        {name:"taskGroupName",type:"string",mapping:"taskGroupName"},
        {name:"taskGroupDesc",type:"string",mapping:"taskGroupDesc"}
    ])
    var reader=new Ext.data.JsonReader({},taskGroupRecord);
    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load();

    var taskGroupPanelByAssigned=new Ext.grid.GridPanel({
        id:"taskGroupPanelByAssigned",
        width:450,
        height:550,
        autoScroll:true,//滚动条
        cm:taskGroupModel,
        sm:sm2,
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        }
    });
    //隐藏第二列
    taskGroupPanelByAssigned.getColumnModel().setHidden(2,true);
    return taskGroupPanelByAssigned;
}

//访问后台 添加任务组
function addTaskGroupEnd(flag){
    //获取任务组名 任务组描述
    var taskGroupinfoForm=Ext.getCmp("addTaskGroupForm");
    var taskGroupName=taskGroupinfoForm.getForm().findField("taskGroupNameInput").getValue();
    var taskGroupDesc=taskGroupinfoForm.getForm().findField("taskGroupDescInput").getValue();
    //获取被选中的任务
    var allTaskPanelForAdd=Ext.getCmp("allTaskPanelForAdd");
    var recordList=allTaskPanelForAdd.getSelectionModel().getSelections();
    var taskArray=new Array();
    for(var i=0;i<recordList.length;i++){
        var taskId=recordList[i].get("taskId");
        var type=recordList[i].get("type");
        var taskPath=recordList[i].get("taskPath");
        var taskName=recordList[i].get("taskName");
        var task=new TaskEntity(taskId,type,taskPath,taskName);
        taskArray.push(task);
    }
    //如果是admin用户 获取被选中的用户组名
    var userGroupNameArray=new Array();
    if(flag==0){
        var userGroupPanel=Ext.getCmp("userGroupPanel");
        var items=userGroupPanel.getSelectionModel().getSelections();
        for(var i=0;i<items.length;i++){
            var userGroupName=items[i].get("userGroupName");
            userGroupNameArray.push(userGroupName);
        }
    }
    //访问后台
    Ext.Ajax.request({
        url:"/taskGroup/addTaskGroup.do",
        success:function(response,config){
            Ext.MessageBox.alert("success");
            Ext.getCmp("addTaskGroupWindow").close();
            Ext.getCmp("chooseTaskWindow").close();
            var chooseUserGroupWindow=Ext.getCmp("chooseUserGroupWindow");
            if(chooseUserGroupWindow)
                chooseUserGroupWindow.close();
            var secondGuidePanel=Ext.getCmp("secondGuidePanel");
            showTaskGroupPanel(secondGuidePanel);
        },
        failure:failureResponse,
        params:{taskGroupName:taskGroupName,taskGroupDesc:taskGroupDesc,
            taskArray:JSON.stringify(taskArray),userGroupNameArray:userGroupNameArray}
    })
}

//任务组版块的分配任务组功能
function taskGroupForAss(){
    var grid=Ext.getCmp("taskGroupAttributesPanel");
    var record=grid.getSelectionModel().getSelected();
    var taskId=record.get("taskId");
    var taskName=record.get("taskName");
    var path=record.get("taskPath");
    var type=record.get("type");
    Ext.getCmp("taskGroupAttributesWindow").close();
    if(type=="job"){
        showWindowByAssigned(taskId,path,taskName,"G");
    }else{
        showWindowForAssigned(taskId,path,taskName,"G");
    }
}


