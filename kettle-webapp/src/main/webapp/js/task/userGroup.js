function allUserGroupPanel(){
    //为表格添加一行复选框用于选择需要操作 的记录
    var sm=new Ext.grid.CheckboxSelectionModel();
    //列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm,
        {header:"用户组名",dataIndex:"userGroupName"},
        {header:"用户组描述",dataIndex:"userGroupDesc"}
    ]);

    //准备数据 使用HttpProxy方式从后台获取json格式的数据
    var proxy=new Ext.data.HttpProxy({url:"/userGroup/beforeAdd.do"});

    //Record定义记录结果
    var human=Ext.data.Record.create([
        {name:"userGroupName",type:"string",mapping:"userGroupName"},
        {name:"userGroupDesc",type:"string",mapping:"userGroupDesc"}
    ])
    var reader=new Ext.data.JsonReader({},human);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load();

    var grid=new Ext.grid.GridPanel({
        id:"userGroupPanel",
        width:400,
        height:470,
        cm:cm,      //列模型
        sm:sm,      //行选择框
        store:store,    //数据源
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        closable:true
    });
   return grid;
}

function generateUserGroupPanel(secondGuidePanel){
    //为表格添加一行复选框用于选择需要操作 的记录
    var sm=new Ext.grid.CheckboxSelectionModel();
    //列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm,
        {header:"用户组id",dataIndex:"userGroupId",align:"center"},
        {header:"用户组名",dataIndex:"userGroupName",align:"center"},
        {header:"用户组描述",dataIndex:"userGroupDesc",align:"center"},
        {header:"操作",dataIndex:"",menuDisabled:true,align:"center",
            renderer:function(v){
                return  "<img src='../../ui/images/i_delete.png' class='imgCls' onclick='deleteUserGroup()' title='删除用户组'/>&nbsp;&nbsp;"+
                    "<img src='../../ui/images/i_editor.png' class='imgCls' onclick='updateUserGroup()' title='修改用户组'/>&nbsp;&nbsp;"+
                    "<img src='../../ui/images/i_detail.png' class='imgCls' onclick='userGroupInfo()' title='用户组详情'/>&nbsp;&nbsp;"+
                    "<img src='../../ui/images/i_assignedSlave.png' class='imgCls' onclick='assignedSlaveForUserGroup()' title='分配节点'/>&nbsp;&nbsp;"+
                    "<img src='../../ui/images/i_assigned.png' class='imgCls' onclick='assignedTaskGroupForUserGroup()' title='分配任务组'/>&nbsp;&nbsp;";
            }
        }
    ]);

    //准备数据 使用HttpProxy方式从后台获取json格式的数据
    var proxy=new Ext.data.HttpProxy({url:"/userGroup/getUserGroupOfThisPage.do"});

    //Record定义记录结果
    var human=Ext.data.Record.create([
        {name:"userGroupId",type:"string",mapping:"userGroupId"},
        {name:"userGroupName",type:"string",mapping:"userGroupName"},
        {name:"userGroupDesc",type:"string",mapping:"userGroupDesc"},
    ])
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},human);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        listeners: {
            "beforeload": function(store) {
                var userGroupName="";
                if(Ext.getCmp("userGroupNameField")!=undefined){
                    userGroupName=Ext.getCmp("userGroupNameField").getValue();
                }
                store.baseParams = {
                    name:userGroupName
                }
            }
        }
    })
    store.load({params:{start:0,limit:15}});


    var inputUserGroupName=undefined;
    if(Ext.getCmp("userGroupNameField")!=undefined){
        inputUserGroupName=Ext.getCmp("userGroupNameField").getValue();
    }
    var nameField=new Ext.form.TextField({
        id:"userGroupNameField",
        name: "name",
        fieldLabel: "用户组名",
        width:150,
        value:inputUserGroupName,
        emptyText:"请输入用户组名.."
    });

    var grid=new Ext.grid.GridPanel({
        id:"userGroupPanel",
        title:"<font size = '3px' >用户组管理</font>",
        height:470,
        cm:cm,      //列模型
        sm:sm,      //行选择框
        store:store,    //数据源
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        closable:true,
        tbar:new Ext.Toolbar({
            buttons:[
                nameField,
                {
                    iconCls:"searchCls",
                    tooltip: '搜索',
                    handler:function () {
                        generateUserGroupPanel(secondGuidePanel);
                    }
                },"-",
                {
                    iconCls:"addCls",
                    tooltip: '新增用户组',
                    handler:function () {
                        fillInBeforeAdd(new Array(),"","",new Array());
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
    });
    grid.getColumnModel().setHidden(2,true);
    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(grid);
    secondGuidePanel.doLayout();
}

//分配任务组
function assignedTaskGroupForUserGroup(){
    var userGroupPanel=Ext.getCmp("userGroupPanel");
    //获取被选中的用户组名
    var userGroupName=userGroupPanel.getSelectionModel().getSelected().get("userGroupName");
    //获取该用户组下可见的任务组名的集合
    Ext.Ajax.request({
        url:"/userGroup/beforeAssignedTaskGroup.do",
        success:function(response,config){
            var taskGroupNameArrayByChoose=Ext.decode(response.responseText).taskGroupNameArray;
            var taskGroupPanel=getAllTaskGroupPanel(taskGroupNameArrayByChoose,"");
            var chooseTaskGroupWindow=new Ext.Window({
                title:"请选择可见任务组",
                modal:true,
                bodyStyle:"background-color:white",
                width:600,
                height:520,
                items:[
                    taskGroupPanel
                ],
                tbar:new Ext.Toolbar({buttons:[
                    {
                        text:"确认",
                        handler:function(){
                            //获取被选中的任务组Id集合
                            var taskGroupNameArray=new Array();
                            var view=taskGroupPanel.getView();
                            var rsm=taskGroupPanel.getSelectionModel();
                            for(var i=0;i<view.getRows().length;i++) {
                                if(rsm.isSelected(i)){
                                    var taskGroupName=taskGroupPanel.getStore().getAt(i).get("taskGroupName");
                                    taskGroupNameArray.push(taskGroupName);
                                }
                            }
                            Ext.Ajax.request({
                                url:"/userGroup/assignedTaskGroup.do",
                                success:function(response,config){
                                    chooseTaskGroupWindow.close();
                                    Ext.MessageBox.alert("success","任务组分配成功");
                                },
                                failure:failureResponse,
                                params:{userGroupName:userGroupName,taskGroupNameArray:taskGroupNameArray}
                            })
                        }
                    }
                ]})
            });
            chooseTaskGroupWindow.show(userGroupPanel);
        },
        failure:function(){},
        params:{userGroupName:userGroupName}
    })
}

//分配节点
function assignedSlaveForUserGroup(){
    var userGroupPanel=Ext.getCmp("userGroupPanel");
    //获取被选中的用户组名
    var userGroupName=userGroupPanel.getSelectionModel().getSelected().get("userGroupName");
    //获取该用户组下可见节点的集合
    Ext.Ajax.request({
        url:"/userGroup/beforeAssignedSlave.do",
        success:function(response,config){
            var slaveIdArrayByChoose=Ext.decode(response.responseText).slaveIdArray;
            var slavePanel=getAllSlavePanel(slaveIdArrayByChoose,"");

            var chooseSlaveWindow=new Ext.Window({
                title:"请选择可见节点",
                modal:true,
                bodyStyle:"background-color:white",
                width:600,
                height:520,
                items:[
                    slavePanel
                ],
                tbar:new Ext.Toolbar({buttons:[
                    {
                        text:"确认",
                        handler:function(){
                            //获取被选中的节点Id集合
                            var slaveIdArray=new Array();
                            var view=slavePanel.getView();
                            var rsm=slavePanel.getSelectionModel();
                            for(var i=0;i<view.getRows().length;i++) {
                                if(rsm.isSelected(i)){
                                    var slaveId=slavePanel.getStore().getAt(i).get("slaveId");
                                    slaveIdArray.push(slaveId);
                                }
                            }
                            Ext.Ajax.request({
                                url:"/userGroup/assignedSlave.do",
                                success:function(response,config){
                                    chooseSlaveWindow.close();
                                    Ext.MessageBox.alert("success","节点分配成功!");
                                },
                                failure:failureResponse,
                                params:{userGroupName:userGroupName,slaveIdArray:slaveIdArray}
                            })
                        }
                    }
                ]})
            });
            chooseSlaveWindow.show(userGroupPanel);
        },
        failure:function(){},
        params:{userGroupName:userGroupName}
    })
}

//删除用户组
function deleteUserGroup(){
    //获取当前登录的用户
    Ext.Ajax.request({
        url:"/user/getLoginUser.do",
        success:function(response,config){
            var password=Ext.decode(response.responseText).user.password;
            var onePassword="";
            var repeatPassword="";
            //设置密码框格式
            var dlg = Ext.Msg.getDialog();
            var t = Ext.get(dlg.body).select('.ext-mb-input');
            t.each(function (el) {
                el.dom.type = "password";
            });
            //删除前进行两次密码验证
            Ext.MessageBox.prompt("输入框","为保证数据安全,请验证登录密码:",function(btn,txt){
                if(btn=="ok"){
                    onePassword=txt;
                    Ext.MessageBox.prompt("输入框","请再次确认密码:",function(btn,txt){
                        if(btn=="ok"){
                            repeatPassword=txt;
                            if(repeatPassword==password && onePassword==password){
                                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                                var userGroupPanel=Ext.getCmp("userGroupPanel");
                                var chooseUserGroupName=userGroupPanel.getSelectionModel().getSelected().get("userGroupName");
                                Ext.Ajax.request({
                                    url:"/userGroup/deleteUserGroup.do",
                                    success:function(response,config){
                                        Ext.MessageBox.alert("success","移除用户组成功!");
                                        generateUserGroupPanel(secondGuidePanel);
                                    },
                                    failure:failureResponse,
                                    params:{userGroupName:chooseUserGroupName}
                                })
                            }else{
                                Ext.MessageBox.alert("faile","密码输入不正确,验证失败!");
                            }
                        }
                    });
                }
            });
        },
        failure:function(){},
        params:{}
    })

}

//用户组详细信息
function userGroupInfo(){
    var userGroupPanel=Ext.getCmp("userGroupPanel");
    var chooseUserGroupName=userGroupPanel.getSelectionModel().getSelected().get("userGroupName");
    //根据被选中的用户组名获取当前用户组下的节点、任务组列表
    var slavePanel=getSlaveByThis(chooseUserGroupName);
    var taskGroupPanel=getTaskGroupByThis(chooseUserGroupName);
    var userPanel=getUserByThis(chooseUserGroupName);
    var infoTabPanel=new Ext.TabPanel({
        width:575,
        height:510
    })
    infoTabPanel.add(slavePanel);
    infoTabPanel.add(taskGroupPanel);
    infoTabPanel.add(userPanel);
    infoTabPanel.setActiveTab(slavePanel);
    var userGroupInfoWindow=new Ext.Window({
        id: "userGroupInfoWindow",
        title: "用户组详情",
        bodyStyle: "background-color:white",
        width: 575,
        modal: true,
        height: 520,
        items: [
            infoTabPanel
        ]
    })
    userGroupInfoWindow.show(userGroupPanel);

}

//修改用户组 获取修改前的数据展示
function updateUserGroup(){
    var userGroupPanel=Ext.getCmp("userGroupPanel");
    var userGroupId=userGroupPanel.getSelectionModel().getSelected().get("userGroupId");
    var groupName=userGroupPanel.getSelectionModel().getSelected().get("userGroupName");
    var groupDesc=userGroupPanel.getSelectionModel().getSelected().get("userGroupDesc");
    //任务组名输入框
    var userGroupNameField=new Ext.form.TextField({
        name: "userGroupNameField",
        fieldLabel: "用户组名",
        width:150,
        value:groupName
    });
    //任务组描述输入框
    var userGroupDescField=new Ext.form.TextArea({
        name: "userGroupDescField",
        fieldLabel: "用户组描述",
        width:300,
        height:100,
        value:groupDesc
    });
    //表单
    var updateUserGroupForm=new Ext.form.FormPanel({
        id:"updateUserGroupForm",
        width:500,
        height:220,
        frame:true,
        labelWidth:130,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:[userGroupNameField,userGroupDescField]
            }
        ]
    });
    var updateUserGroupWindow=new Ext.Window({
        id:"updateUserGroupWindow",
        title:"修改用户组",
        bodyStyle:"background-color:white",
        width:500,
        modal:true,
        height:220,
        items:[
            updateUserGroupForm
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"修改",
                handler:function(){
                    var userGroupName=userGroupNameField.getValue();
                    var userGroupDesc=userGroupDescField.getValue();
                    if(userGroupName==undefined || userGroupName==""){
                        Ext.MessageBox.alert("用户组名不能为空!");
                        return;
                    }else{
                        Ext.Ajax.request({
                            url:"/userGroup/updateUserGroup.do",
                            success:function(response,config){
                                if(response.responseText=="Y"){
                                    Ext.MessageBox.alert("修改失败","该用户组名已存在!");
                                    userGroupNameField.setValue("");
                                }else{
                                    Ext.MessageBox.alert("success","修改成功!");
                                    updateUserGroupWindow.close();
                                    generateUserGroupPanel(Ext.getCmp("secondGuidePanel"));
                                }
                            },
                            failure:function(response){
                                updateUserGroupWindow.close();
                                failureResponse(response);
                            },
                            params:{name:userGroupName,desc:userGroupDesc,id:userGroupId}
                        })
                    }
                }
            }
        ]})
    });
    updateUserGroupWindow.show(userGroupPanel);
}

//新增用户组  填写用户组名 用户组描述
function fillInBeforeAdd(groupName,groupDesc,taskGroupNameArray,slaveIdArray){
    var userGroupPanel=Ext.getCmp("userGroupPanel");
    //任务组名输入框
    var userGroupNameField=new Ext.form.TextField({
        id:"userGroupNameField",
        name: "userGroupNameField",
        fieldLabel: "用户组名",
        width:150,
        value:groupName
    });
    //任务组描述输入框
    var userGroupDescField=new Ext.form.TextArea({
        id:"userGroupDescField",
        name: "userGroupDescField",
        fieldLabel: "用户组描述",
        width:300,
        height:100,
        value:groupDesc
    });
    //表单
    var addUserGroupForm=new Ext.form.FormPanel({
        id:"addUserGroupForm",
        width:500,
        height:220,
        frame:true,
        labelWidth:130,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:[userGroupNameField,userGroupDescField]
            }
        ]
    });
    var addUserGroupWindow=new Ext.Window({
        id:"addUserGroupWindow",
        title:"新增用户组",
        bodyStyle:"background-color:white",
        width:500,
        modal:true,
        height:220,
        items:[
            addUserGroupForm
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"下一步",
                handler:function(){
                    var userGroupName=userGroupNameField.getValue();
                    if(userGroupName==undefined || userGroupName==""){
                        Ext.MessageBox.alert("用户组名不能为空!");
                        return;
                    }else{
                        Ext.Ajax.request({
                            url:"/userGroup/decideGroupNameExist.do",
                            success:function(response,config){
                                if(response.responseText=="Y"){
                                    Ext.MessageBox.alert("该用户组名已存在!");
                                    userGroupNameField.setValue("");
                                }else{
                                    var userGroupDesc=Ext.getCmp("userGroupDescField").getValue();
                                    var userGroupName=Ext.getCmp("userGroupNameField").getValue();
                                    addUserGroupWindow.close();
                                    chooseVisualTaskGroup(taskGroupNameArray,userGroupName,userGroupDesc,slaveIdArray);
                                }
                            },
                            failure:function(response){
                                addUserGroupWindow.close();
                                failureResponse(response);
                            },
                            params:{name:userGroupName}
                        })
                    }
                }
            }
        ]})
    });
    addUserGroupWindow.show(userGroupPanel);
}

//新增用户组     选择可见任务组
function chooseVisualTaskGroup(taskGroupNameArray,userGroupName,userGroupDesc,slaveIdArray){
    var addUserGroupWindow=Ext.getCmp("addUserGroupWindow");
    var userGroupPanel=Ext.getCmp("userGroupPanel");
    //展示所有用户组 选择界面
    var taskGroupPanel=getAllTaskGroupPanel(taskGroupNameArray,"");
    //打开一个新的窗口展现该列表
    var chooseTaskGroupWindow=new Ext.Window({
        id:"chooseTaskGroupWindow",
        title:"请选择可见任务组",
        modal:true,
        bodyStyle:"background-color:white",
        width:600,
        height:520,
        items:[
            taskGroupPanel
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"下一步",
                handler:function(){
                    //获取被选中的任务组Id集合
                    var taskGroupPanelForAdd=Ext.getCmp("taskGroupPanelForAdd");
                    var taskGroupNameArray=new Array();
                    var view=taskGroupPanelForAdd.getView();
                    var rsm=taskGroupPanelForAdd.getSelectionModel();
                    for(var i=0;i<view.getRows().length;i++) {
                        if(rsm.isSelected(i)){
                            var taskGroupName=taskGroupPanelForAdd.getStore().getAt(i).get("taskGroupName");
                            taskGroupNameArray.push(taskGroupName);
                        }
                    }
                    chooseVisualSlave(taskGroupNameArray,userGroupName,userGroupDesc,slaveIdArray);
                }
            },"-",
            {
                text:"上一步",
                handler:function(){
                    //获取被选中的任务组Id集合
                    var taskGroupPanelForAdd=Ext.getCmp("taskGroupPanelForAdd");
                    var taskGroupNameArray=new Array();
                    var view=taskGroupPanelForAdd.getView();
                    var rsm=taskGroupPanelForAdd.getSelectionModel();
                    for(var i=0;i<view.getRows().length;i++) {
                        if(rsm.isSelected(i)){
                            var taskGroupName=taskGroupPanelForAdd.getStore().getAt(i).get("taskGroupName");
                            taskGroupNameArray.push(taskGroupName);
                        }
                    }
                    chooseTaskGroupWindow.close();
                    fillInBeforeAdd(userGroupName,userGroupDesc,taskGroupNameArray,slaveIdArray);
                }
            }
        ]})
    });
    chooseTaskGroupWindow.show(userGroupPanel);
}

//新增用户组     选择可见节点
function chooseVisualSlave(taskGroupNameArray,userGroupName,userGroupDesc,slaveIdArray){
    var chooseTaskGroupWindow=Ext.getCmp("chooseTaskGroupWindow");
    chooseTaskGroupWindow.close();
    //展现节点选择弹窗
    var slavePanel=getAllSlavePanel(slaveIdArray,"");
    var chooseSlaveWindow=new Ext.Window({
        id:"chooseSlaveWindow",
        title:"请选择可见节点",
        modal:true,
        bodyStyle:"background-color:white",
        width:600,
        height:535,
        items:[
            slavePanel
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"确认",
                handler:function(){
                    Ext.MessageBox.confirm("提示","确认创建?",function(btn){
                        if(btn=="yes"){
                            //获取被选中的节点Id集合
                            var slaveIdArray=new Array();
                            var view=slavePanel.getView();
                            var rsm=slavePanel.getSelectionModel();
                            for(var i=0;i<view.getRows().length;i++) {
                                if(rsm.isSelected(i)){
                                    var slaveId=slavePanel.getStore().getAt(i).get("slaveId");
                                    slaveIdArray.push(slaveId);
                                }
                            };

                            Ext.Ajax.request({
                                url:"/userGroup/addUserGroup.do",
                                success:function(response,config){
                                    Ext.MessageBox.alert("提示","用户组创建成功!");
                                    chooseSlaveWindow.close();
                                    generateUserGroupPanel(Ext.getCmp("secondGuidePanel"));
                                },
                                failure:function(response){
                                    chooseSlaveWindow.close();
                                    failureResponse(response);
                                },
                                params:{slaveIdArray:slaveIdArray,taskGroupNameArray:taskGroupNameArray,
                                    userGroupName:userGroupName,userGroupDesc:userGroupDesc}
                            })
                        }else{
                            return;
                        }
                    })
                }
            },"-",
            {
                text:"上一步",
                handler:function(){
                    //获取被选中的节点Id集合
                    var slaveIdArray=new Array();
                    var view=slavePanel.getView();
                    var rsm=slavePanel.getSelectionModel();
                    for(var i=0;i<view.getRows().length;i++) {
                        if(rsm.isSelected(i)){
                            var slaveId=slavePanel.getStore().getAt(i).get("slaveId");
                            slaveIdArray.push(slaveId);
                        }
                    }
                    chooseSlaveWindow.close();
                    chooseVisualTaskGroup(taskGroupNameArray,userGroupName,userGroupDesc,slaveIdArray);
                }
            }
        ]})
    });
    chooseSlaveWindow.show(userGroupPanel);
}

//获取所有任务组  默认选中参数数组中的任务组名
function getAllTaskGroupPanel(taskGroupNameArray,title){

    sm2=new Ext.grid.CheckboxSelectionModel();
    //节点列模型
    var allTaskPanelModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"任务组id",dataIndex:"taskGroupId"},
        {header:"任务组名",dataIndex:"taskGroupName"},
        {header:"任务组描述",dataIndex:"taskGroupDesc"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/userGroup/getAllTaskGroupBeforeAdd.do"});

    var allTaskRecord=Ext.data.Record.create([
        {name:"taskGroupId",type:"string",mapping:"taskGroupId"},
        {name:"taskGroupName",type:"string",mapping:"taskGroupName"},
        {name:"taskGroupDesc",type:"string",mapping:"taskGroupDesc"}
    ])
    //totalProperty代表总条数 root代表当页的数据
    var reader=new Ext.data.JsonReader({},allTaskRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load();

    var taskGroupPanelForAdd=new Ext.grid.GridPanel({
        title:title,
        autoScroll:true,
        id:"taskGroupPanelForAdd",
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
    //taskGroupPanelForAdd.getColumnModel().setHidden(2,true);
    //监听事件 panel数据加载完毕后执行   用户点击上一步后把之前选中的数据还原选中
    taskGroupPanelForAdd.store.on("load",function(store) {
        var view=taskGroupPanelForAdd.getView();
        var rsm=taskGroupPanelForAdd.getSelectionModel();
        //需要选中的行号的数组
        var chooseIndex=new Array();
        //获取需要选中的行号
        for(var k=0;k<taskGroupNameArray.length;k++){
            var chooseTaskGroupName=taskGroupNameArray[k];
            for(var i= 0;i<view.getRows().length;i++){
                var taskGroupName=taskGroupPanelForAdd.getStore().getAt(i).get("taskGroupName");
                if(chooseTaskGroupName==taskGroupName){
                    chooseIndex.push(i);
                    break;
                }
            }
        }
        if(chooseIndex.length>0){
            rsm.selectRows(chooseIndex,true);
        }
    },taskGroupPanelForAdd);
    if(title!=""){
        taskGroupPanelForAdd.getColumnModel().setHidden(1,true);
    }
    return taskGroupPanelForAdd;
}

//获取所有节点   默认选中参数数组中节点id
function getAllSlavePanel(slaveIdArray,title){
    var sm2=new Ext.grid.CheckboxSelectionModel();
    var slaveModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"slaveId",width:50,dataIndex:"slaveId"},
        {header:"主机名",width:140,dataIndex:"hostName"},
        {header:"端口",width:90,dataIndex:"port"},
        {header:"负载指数",width:90,dataIndex:"loadAvg",tooltip:"这是负载指数"},
        {header:"状态",width:200,dataIndex:"status",align:"center"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/slave/getSlave.do"});

    var slaveRecord=Ext.data.Record.create([
        {name:"slaveId",type:"string",mapping:"slaveId"},
        {name:"hostName",type:"string",mapping:"hostName"},
        {name:"port",type:"string",mapping:"port"},
        {name:"loadAvg",type:"string",mapping:"loadAvg"},
        {name:"status",type:"string",mapping:"status"}
    ])
    var reader=new Ext.data.JsonReader({},slaveRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load();

    var slaveGridPanel=new Ext.grid.GridPanel({
        title:title,
        autoScroll:true,
        id:"slaveGridPanelBeforeAdd",
        width:590,
        height:500,
        cm:slaveModel,      //列模型
        sm:sm2,      //行选择框
        store:store,    //数据源
        closable:true
    });

    //监听事件 panel数据加载完毕后执行   用户点击上一步后把之前选中的数据还原选中
    slaveGridPanel.store.on("load",function(store) {
        var view=slaveGridPanel.getView();
        var rsm=slaveGridPanel.getSelectionModel();
        //需要选中的行号的数组
        var chooseIndex=new Array();
        //获取需要选中的行号
        for(var k=0;k<slaveIdArray.length;k++){
            var chooseSlaveId=slaveIdArray[k];
            for(var i= 0;i<view.getRows().length;i++){
                var slaveId=slaveGridPanel.getStore().getAt(i).get("slaveId");
                if(chooseSlaveId==slaveId){
                    chooseIndex.push(i);
                    break;
                }
            }
        }
        if(chooseIndex.length>0){
            rsm.selectRows(chooseIndex,true);
        }
    },slaveGridPanel);
    slaveGridPanel.getColumnModel().setHidden(2,true);
    if(title!=""){
        slaveGridPanel.getColumnModel().setHidden(1,true);
    }
    return slaveGridPanel;
}

//获取当前用户组下的任务组
function getTaskGroupByThis(chooseUserGroupName){
    //节点列模型
    var allTaskPanelModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        {header:"任务组id",dataIndex:"taskGroupId"},
        {header:"任务组名",dataIndex:"taskGroupName"},
        {header:"任务组描述",dataIndex:"taskGroupDesc"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/userGroup/taskGroupByUserGroup.do"});

    var allTaskRecord=Ext.data.Record.create([
        {name:"taskGroupId",type:"string",mapping:"taskGroupId"},
        {name:"taskGroupName",type:"string",mapping:"taskGroupName"},
        {name:"taskGroupDesc",type:"string",mapping:"taskGroupDesc"}
    ])
    //totalProperty代表总条数 root代表当页的数据
    var reader=new Ext.data.JsonReader({},allTaskRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load({params:{userGroupName:chooseUserGroupName}});

    var taskGroupPanelForAdd=new Ext.grid.GridPanel({
        title:"任务组",
        autoScroll:true,
        id:"taskGroupPanelForAdd",
        width:595,
        height:500,
        cm:allTaskPanelModel,
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        }
    });
    taskGroupPanelForAdd.getColumnModel().setHidden(1,true);
    return taskGroupPanelForAdd;
}

//获取当前用户组下的节点
function getSlaveByThis(chooseUserGroupName){

    var slaveModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        {header:"slaveId",width:50,dataIndex:"slaveId"},
        {header:"主机名",width:140,dataIndex:"hostName"},
        {header:"端口",width:90,dataIndex:"port"},
        {header:"负载指数",width:90,dataIndex:"loadAvg",tooltip:"这是负载指数"},
        {header:"状态",width:200,dataIndex:"status",align:"center"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/userGroup/slaveByUserGroup.do"});

    var slaveRecord=Ext.data.Record.create([
        {name:"slaveId",type:"string",mapping:"slaveId"},
        {name:"hostName",type:"string",mapping:"hostName"},
        {name:"port",type:"string",mapping:"port"},
        {name:"loadAvg",type:"string",mapping:"loadAvg"},
        {name:"status",type:"string",mapping:"status"}
    ])
    var reader=new Ext.data.JsonReader({},slaveRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load({params:{userGroupName:chooseUserGroupName}});

    var slaveGridPanel=new Ext.grid.GridPanel({
        title:"节点",
        autoScroll:true,
        id:"slaveGridPanelBeforeAdd",
        width:590,
        height:500,
        cm:slaveModel,      //列模型
        store:store,    //数据源
        closable:true
    });
    slaveGridPanel.getColumnModel().setHidden(1,true);

    return slaveGridPanel;
}

//获取当前用户组下的所有用户
function getUserByThis(chooseUserGroupName){
    //列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        {header:"type",dataIndex:"userType",menuDisabled:true,align:"center",
            renderer:function(v){
                if(v==1){
                    return "管理员";
                }else{
                    return "普通用户";
                }
            }
        },
        {header:"描述",dataIndex:"description"},
        {header:"用户名",dataIndex:"login"},
        {header:"任务组权限",dataIndex:"taskGroupPower",menuDisabled:true,align:"center",
            renderer:function(v){
                if(v==1){
                    return "可操作";
                }else{
                    return "只读";
                }
            }
        },
        {header:"节点权限",dataIndex:"slavePower",menuDisabled:true,align:"center",
            renderer:function(v){
                if(v==1){
                    return "可操作";
                }else{
                    return "只读";
                }
            }
        }
    ]);
    var proxy=new Ext.data.HttpProxy({url:"/user/getUsersByInfo.do"});
    //Record定义记录结果
    var human=Ext.data.Record.create([
        {name:"userType",type:"int",mapping:"userType"},
        {name:"description",type:"string",mapping:"description"},
        {name:"login",type:"string",mapping:"login"},
        {name:"taskGroupPower",type:"int",mapping:"taskGroupPower"},
        {name:"slavePower",type:"int",mapping:"slavePower"}
    ])
    var reader=new Ext.data.JsonReader({},human);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load({params:{userGroupName:chooseUserGroupName}});
    var grid=new Ext.grid.GridPanel({
        id:"usersPanel",
        title:"用户",
        height:500,
        cm:cm,      //列模型
        store:store,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        closable:true
    });
    return grid;
}

