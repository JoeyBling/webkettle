//展示用户信息
function showUserPanel(secondGuidePanel){
    //为表格添加一行复选框用于选择行
    var sm=new Ext.grid.CheckboxSelectionModel();
    //列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm,
        {header:"id",dataIndex:"userId",align:"center"},
        {header:"type",dataIndex:"userType",menuDisabled:true,align:"center",
            renderer:function(v){
                if(v==1){
                    return "管理员";
                }else{
                    return "普通用户";
                }
            }
        },
        {header:"password",dataIndex:"password",align:"center"},
        {header:"创建时间",dataIndex:"createDate",format:"y-M-d H:m:s",align:"center"},
        {header:"描述",dataIndex:"description",align:"center"},
        {header:"用户名",dataIndex:"login",align:"center"},
        {header:"所属用户组",dataIndex:"belongToUserGroup",align:"center"},
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
        },
        {header:"操作",width:280,dataIndex:"",menuDisabled:true,align:"center",
            renderer:function(v){
                if(loginUserName=="admin"){
                    return  "<img src='../../ui/images/i_delete.png' class='imgCls' onclick='deleteUser()' title='删除用户'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_editor.png' class='imgCls' onclick='updateUser()' title='修改用户'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_updatePwd.png' class='imgCls' onclick='updatePassword()' title='修改密码'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_updateUG.png' class='imgCls' onclick='allotUserGroup()' title='变更用户组'/>&nbsp;&nbsp;";
                }else{
                    return "<img src='../../ui/images/i_delete.png' class='imgCls' onclick='deleteUser()' title='删除用户'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_editor.png' class='imgCls' onclick='updateUser()' title='修改用户'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_updatePwd.png' class='imgCls' onclick='updatePassword()' title='修改密码'/>&nbsp;&nbsp;";
                }
            }
        }
    ]);
    var proxy=new Ext.data.HttpProxy({url:"/user/getUsers.do"});
    //Record定义记录结果
    var human=Ext.data.Record.create([
        {name:"userId",type:"string",mapping:"userId"},
        {name:"userType",type:"int",mapping:"userType"},
        {name:"password",type:"string",mapping:"password"},
        {name:"createDate",type:"string",mapping:"createDate"},
        {name:"description",type:"string",mapping:"description"},
        {name:"login",type:"string",mapping:"login"},
        {name:"belongToUserGroup",type:"string",mapping:"belongToUserGroup"},
        {name:"taskGroupPower",type:"int",mapping:"taskGroupPower"},
        {name:"slavePower",type:"int",mapping:"slavePower"}
    ])
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},human);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        listeners: {
            "beforeload": function(store) {
                var usernameTo="";
                var usertypeTo="";
                var usergroupTo="";
                if(Ext.getCmp("userTypeCombox"))
                    usertypeTo=Ext.getCmp("userTypeCombox").getValue();
                if(Ext.getCmp("userNameField"))
                    usernameTo=Ext.getCmp("userNameField").getValue();
                if(Ext.getCmp("userGroupCombox"))
                    userGroupTo=Ext.getCmp("userGroupCombox").getValue();
                store.baseParams = {
                    username:usernameTo,
                    usertype:usertypeTo,
                    usergroup:usergroupTo
                }
            }
        }
    })
    store.load({params:{start:0,limit:10}});
    var inputUsername="";
    var chooseUsertype="";
    var chooseUsergroup="";

    if(Ext.getCmp("userTypeCombox"))
        chooseUsertype=Ext.getCmp("userTypeCombox").getValue();
    if(Ext.getCmp("userNameField"))
        inputUsername=Ext.getCmp("userNameField").getValue();
    if(Ext.getCmp("userGroupCombox"))
        chooseUsergroup=Ext.getCmp("userGroupCombox").getValue();

    //用户名搜索框
    var usernameField=new Ext.form.TextField({
        id:"userNameField",
        name: "username",
        fieldLabel: "用户名",
        width:150,
        value:inputUsername,
        emptyText:"请输入用户名.."
    });

    var userGroupCom=userGroupCombobox(chooseUsergroup);
    var userTypeCom=userTypeCombobox(chooseUsertype);
    var grid=new Ext.grid.GridPanel({
        id:"usersPanel",
        title:"<font size = '3px' >用户管理</font>",
        height:470,
        cm:cm,      //列模型
        sm:sm,
        store:store,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        closable:true,
        tbar:new Ext.Toolbar({
            buttons:[
                userGroupCom,
                userTypeCom,
                usernameField,"-",
                {
                    iconCls:"searchCls",
                    tooltip: '搜索',
                    handler:function(){
                        showUserPanel(secondGuidePanel);
                    }
                },
                {
                    iconCls:"addCls",
                    tooltip: '新增用户',
                    handler:function(){
                        beforeAddUser();
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
    //grid.getColumnModel().setHidden(3,true);
    grid.getColumnModel().setHidden(4,true);
    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(grid);
    secondGuidePanel.doLayout();
    if(loginUserName!="admin"){
        Ext.getCmp("userGroupCombox").hide();
        Ext.getCmp("userTypeCombox").hide();
    }
}

//修改用户
function updateUser(){
    var grid=Ext.getCmp("usersPanel");
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    //获取被选中行的数据
    var record=grid.getSelectionModel().getSelected();
    var login=record.get("login");
    var password=record.get("password");
    var description=record.get("description");
    var userId=record.get("userId");
    var slavePower=record.get("slavePower");
    var taskGroupPower=record.get("taskGroupPower");
    var userType=record.get("userType");
    var updateForm=userformForUpdate(login,description,slavePower,taskGroupPower,userType);
    //生成修改窗口
    var updateUserWindow=new Ext.Window({
        title:"修改用户",
        modal:true,
        bodyStyle:"background-color:white",
        width:400,
        height:400,
        items:[
            updateForm
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"提交",
                handler:function(){
                    //表单所有控件作为提交参数
                    var userIdHidden=new Ext.form.Hidden({
                        name:"userId",
                        value:userId
                    });
                    updateForm.items.add(userIdHidden);
                    updateForm.doLayout();
                    updateForm.baseParams=updateForm.getForm().getValues();
                    if(updateForm.getForm().isValid()){
                        updateForm.getForm().submit({
                            success:function(form,action){
                                Ext.MessageBox.alert("成功","修改用户成功!");
                                updateUserWindow.close();
                                showUserPanel(secondGuidePanel);
                            },
                            failure:failureResponse
                        })
                    }else{
                        Ext.MessageBox.alert("提交失败","表单存在不规范填写,请再次确认后提交!");
                    }
                }
            }
        ]})
    });
    updateUserWindow.show(grid);
}

//添加用户  添加前判断是哪个用户在进行创建操作
function beforeAddUser(){
    if(loginUserName=="admin"){
        //admin创建用户
        createUserByAdmin("","","","","","","");

    }else{
        //普通管理员创建用户
        createUserByCommonAdmin();
    }
}

//添加用户  admin创建用户:选择创建哪种类型的用户
function createUserByAdmin(userTypeValue,inputUserName,inputPassword,inputDesc,slavePowerChoose,taskGroupPowerChoose,userGroupChoose){
    var grid=Ext.getCmp("usersPanel");
    //管理员用户选项
    var radioAdminUser=new Ext.form.Radio({
        name:"rdaUserType",
        inputValue:1,
        boxLabel:"管理员",
        checked:true
    })
    //普通用户选项
    var radioCommonUser=new Ext.form.Radio({
        name:"rdaUserType",
        inputValue:2,
        boxLabel:"普通用户"
    })
    var grpUserType=new Ext.form.RadioGroup({
        name:"userType",
        fieldLable:"用户类型",
        items:[radioAdminUser,radioCommonUser]
    })
    if(userTypeValue!=""){
        grpUserType.setValue(userTypeValue);
    }
    //表单
    var userTypeChooseForm=new Ext.form.FormPanel({
        width:350,
        height:90,
        frame:true,
        labelWidth:70,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:[grpUserType]
            }
        ]
    });
    //用户类型选择窗口
    var userTypeChooseWindow=new Ext.Window({
        title:"请选择创建的用户类型",
        modal:true,
        bodyStyle:"background-color:white",
        width:350,
        height:100,
        items:[userTypeChooseForm],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"下一步",
                handler:function(){
                    userTypeValue=grpUserType.getValue().inputValue;
                    userTypeChooseWindow.close();
                    userAddFormByAdmin(userTypeValue,inputUserName,inputPassword,inputDesc,slavePowerChoose,taskGroupPowerChoose,userGroupChoose);
                }
            }
        ]})
    })
    userTypeChooseWindow.show(grid);
}

//添加用户 admin创建用户:填写创建用户所需要的信息（用户名、密码、描述、对节点和任务组权限、选择用户组）
function userAddFormByAdmin(userTypeValue,inputUserName,inputPassword,inputDesc,slavePowerChoose,taskGroupPowerChoose,userGroupChoose){
    var grid=Ext.getCmp("usersPanel");
    var f=generateUserInfoField(userTypeValue,inputUserName,inputDesc,inputPassword,slavePowerChoose,taskGroupPowerChoose,userGroupChoose);
    //用户类型选择窗口
    var userInfoWindowForAdd=new Ext.Window({
        title:"用户信息填写",
        modal:true,
        bodyStyle:"background-color:white",
        width:400,
        height:350,
        items:[f],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"确认",
                handler:function(){
                    if(f.getForm().isValid()){
                        //获取表单填写的信息
                        inputUserName=f.getForm().findField("userLogin").getValue();
                        inputDesc=f.getForm().findField("userDescription").getValue();
                        inputPassword=f.getForm().findField("userPassword").getValue();
                        if(userTypeValue==2){
                            slavePowerChoose=f.getForm().findField("slavePowerField").getValue().inputValue;
                            taskGroupPowerChoose=f.getForm().findField("grpTaskGroupField").getValue().inputValue;
                        }
                        userGroupChoose=Ext.getCmp("userGroupCombobox").getRawValue();
                        //判断是否选择了用户组
                        if(userGroupChoose==""){
                            Ext.MessageBox.alert("faile","必须为该用户分配一个用户组!");
                        }else{
                            Ext.Ajax.request({
                                url:"/user/addUser.do",
                                success:function(response,config){
                                    var result=Ext.decode(response.responseText);
                                    if(result.isSuccess){
                                        userInfoWindowForAdd.close();
                                        Ext.MessageBox.alert("success","添加成功");
                                        var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                                        showUserPanel(secondGuidePanel);
                                    }else{
                                        Ext.MessageBox.alert("faile","该用户名已存在!");
                                        f.getForm().findField("userLogin").setValue("");
                                    }
                                },
                                failure:failureResponse,
                                params:{username:inputUserName,password:inputPassword, desc:inputDesc,
                                slavePower:slavePowerChoose,taskGroupPower:taskGroupPowerChoose,
                                userType:userTypeValue,userGroupName:userGroupChoose}
                            })
                        }
                    }else{
                        Ext.MessageBox.alert("faile","表单存在不规范填写!");
                    }
                }
            },"-",
            {
                text:"上一步",
                handler:function(){
                    //获取表单填写的信息
                    inputUserName=f.getForm().findField("userLogin").getValue();
                    inputDesc=f.getForm().findField("userDescription").getValue();
                    inputPassword=f.getForm().findField("userPassword").getValue();
                    if(userTypeValue==2){
                        slavePowerChoose=f.getForm().findField("slavePowerField").getValue().inputValue;
                        taskGroupPowerChoose=f.getForm().findField("grpTaskGroupField").getValue().inputValue;
                    }
                    userGroupChoose=Ext.getCmp("userGroupCombobox").getRawValue();
                    userInfoWindowForAdd.close();
                    createUserByAdmin(userTypeValue,inputUserName,inputPassword,inputDesc,slavePowerChoose,taskGroupPowerChoose,userGroupChoose);
                }
            }
        ]})
    })
    userInfoWindowForAdd.show(grid);
}

//添加用户  普通管理员创建用户
function createUserByCommonAdmin(){
    var grid=Ext.getCmp("usersPanel");
    var f=generateUserInfoField(2,"","","","","",belongToUserGroup);
    var userInfoWindowForAdd=new Ext.Window({
        title:"用户信息填写",
        modal:true,
        bodyStyle:"background-color:white",
        width:400,
        height:300,
        items:[f],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"确认",
                handler:function(){
                    var inputUserName=f.getForm().findField("userLogin").getValue();
                    var inputDesc=f.getForm().findField("userDescription").getValue();
                    var inputPassword=f.getForm().findField("userPassword").getValue();
                    var slavePowerChoose=f.getForm().findField("slavePowerField").getValue().inputValue;
                    var taskGroupPowerChoose=f.getForm().findField("grpTaskGroupField").getValue().inputValue;
                    Ext.Ajax.request({
                        url:"/user/addUser.do",
                        success:function(response,config){
                            var result=Ext.decode(response.responseText);
                            if(result.isSuccess){
                                userInfoWindowForAdd.close();
                                Ext.MessageBox.alert("success","添加成功");
                                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                                showUserPanel(secondGuidePanel);
                            }else{
                                Ext.MessageBox.alert("faile","该用户名已存在!");
                                f.getForm().findField("userLogin").setValue("");
                            }
                        },
                        failure:failureResponse,
                        params:{username:inputUserName,password:inputPassword, desc:inputDesc,
                            slavePower:slavePowerChoose,taskGroupPower:taskGroupPowerChoose,
                            userType:2,userGroupName:belongToUserGroup}
                    })
                }
            }
        ]})
    })
    userInfoWindowForAdd.show(grid);
}

/*生成添加用户所需要的用户信息组件
* userTypeValue         用户类型        1:创建管理员用户 2:创建普通用户
* inputUserName         用户名
* inputDesc             描述
* inputPassword         密码
* slavePowerChoose      对节点的权限      1:可操作   2:只读
* taskGroupPowerChoose  对任务组的权限     1:可操作   2:只读
* userGroupChoose       所属任务组
* */
function generateUserInfoField(userTypeValue,inputUserName,inputDesc,inputPassword,slavePowerChoose,taskGroupPowerChoose,userGroupChoose){
    var itemArray=new Array();
    //登录名 login输入框
    var userLoginInput=new Ext.form.TextField({
        name: "userLogin",
        fieldLabel: "用户名",
        width:150,
        value:inputUserName,
        allowBlank:false
    });
    //用户描述
    var userDescriptionInput=new Ext.form.TextArea({
        name: "userDescription",
        fieldLabel: "备注",
        width:300,
        height:100,
        value:inputDesc
    });
    var passwordInput=new Ext.form.TextField({
        name: "userPassword",
        fieldLabel: "密码",
        width:150,
        allowBlank:false,
        inputType: 'password',
        value:inputPassword,
        regex:/^[a-zA-Z0-9]{6,10}$/,
        invalidText:"密码必须在6-10字符",
        validateOnBlur:true
    });
    itemArray.push(userLoginInput);
    itemArray.push(userDescriptionInput);
    itemArray.push(passwordInput);
    if(loginUserName=="admin"){
        itemArray.push(generateUserGroupSelect(userGroupChoose));
    }
    if(userTypeValue==2){
        //节点权限单选按钮
        var radioWriteSlave=new Ext.form.Radio({
            name:"rdaSlavePower",
            inputValue:1,
            boxLabel:"可操作",
            checked:true
        })
        var radioReadSlave=new Ext.form.Radio({
            name:"rdaSlavePower",
            inputValue:2,
            boxLabel:"只读"
        })
        var grpSlavePower=new Ext.form.RadioGroup({
            name:"slavePowerField",
            fieldLabel:"节点",
            items:[radioWriteSlave,radioReadSlave]
        })
        if(slavePowerChoose!=""){
            grpSlavePower.setValue(slavePowerChoose);
        }

        //任务组权限单选按钮
        var radioReadTaskGroup=new Ext.form.Radio({
            name:"rdaTaskGroup",
            inputValue:1,
            boxLabel:"可操作",
            checked:true
        })
        var radioWriteTaskGroup=new Ext.form.Radio({
            name:"rdaTaskGroup",
            inputValue:2,
            boxLabel:"只读"
        })
        var grpTaskGroupPower=new Ext.form.RadioGroup({
            name:"grpTaskGroupField",
            fieldLabel:"任务组",
            items:[radioReadTaskGroup,radioWriteTaskGroup]
        })
        if(taskGroupPowerChoose!=""){
            grpTaskGroupPower.setValue(taskGroupPowerChoose);
        }
        itemArray.push(grpSlavePower);
        itemArray.push(grpTaskGroupPower);
    }
    //表单
    var userInfoForm=new Ext.form.FormPanel({
        width:400,
        height:350,
        frame:true,
        labelWidth:50,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:itemArray
            }
        ]
    });
    return userInfoForm;
}

//生成用户组选择下拉框
function generateUserGroupSelect(userGroupChoose){
    var proxy=new Ext.data.HttpProxy({url:"/userGroup/getUserGroupSelect.do"});

    var userGroup=Ext.data.Record.create([
        {name:"userGroupId",type:"String",mapping:"userGroupId"},
        {name:"userGroupName",type:"String",mapping:"userGroupName"}
    ]);

    var reader=new Ext.data.JsonReader({},userGroup);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    });

    var userGroupCombobox=new Ext.form.ComboBox({
        name:"userGroupCombobox",
        id:"userGroupCombobox",
        triggerAction:"all",
        store:store,
        displayField:"userGroupName",
        valueField:"userGroupId",
        mode:"remote",
        emptyText:"用户组选择"
    })
    if(userGroupChoose!=""){
        userGroupCombobox.setValue(userGroupChoose);
        userGroupCombobox.setRawValue(userGroupChoose);
    }
    return userGroupCombobox;
}

//修改用户所需要的表单
function userformForUpdate(inputUserName,inputDesc,slavePowerChoose,taskGroupPowerChoose,userType){
    var itemArray=new Array();
    //登录名 login输入框
    var userLoginInput=new Ext.form.TextField({
        name: "userLogin",
        fieldLabel: "用户名",
        width:150,
        value:inputUserName,
        readOnly:true,
        allowBlank:false
    });
    //用户描述
    var userDescriptionInput=new Ext.form.TextArea({
        name: "userDescription",
        fieldLabel: "备注",
        width:300,
        height:100,
        value:inputDesc
    });
    itemArray.push(userLoginInput);
    itemArray.push(userDescriptionInput);
    if(userType!=1){
        var radioWriteSlave=new Ext.form.Radio({
            name:"rdaSlavePower",
            inputValue:1,
            boxLabel:"可操作",
            checked:true
        })
        var radioReadSlave=new Ext.form.Radio({
            name:"rdaSlavePower",
            inputValue:2,
            boxLabel:"只读"
        })
        var grpSlavePower=new Ext.form.RadioGroup({
            name:"slavePowerField",
            fieldLabel:"节点",
            items:[radioWriteSlave,radioReadSlave]
        })
        if(slavePowerChoose!=""){
            grpSlavePower.setValue(slavePowerChoose);
        }

        //任务组权限单选按钮
        var radioReadTaskGroup=new Ext.form.Radio({
            name:"rdaTaskGroup",
            inputValue:1,
            boxLabel:"可操作",
            checked:true
        })
        var radioWriteTaskGroup=new Ext.form.Radio({
            name:"rdaTaskGroup",
            inputValue:2,
            boxLabel:"只读"
        })
        var grpTaskGroupPower=new Ext.form.RadioGroup({
            name:"grpTaskGroupField",
            fieldLabel:"任务组",
            items:[radioReadTaskGroup,radioWriteTaskGroup]
        })
        if(taskGroupPowerChoose!=""){
            grpTaskGroupPower.setValue(taskGroupPowerChoose);
        }
        itemArray.push(grpSlavePower);
        itemArray.push(grpTaskGroupPower);
    }
    //表单
    var userInfoForm=new Ext.form.FormPanel({
        url:"/user/updateUser.do",
        width:400,
        height:400,
        frame:true,
        labelWidth:50,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:itemArray
            }
        ]
    });

    return userInfoForm;
}

//分配用户组
function allotUserGroup(){
    var itemArray=new Array();
    var grid=Ext.getCmp("usersPanel");
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    //获取被选中行的数据
    var record=grid.getSelectionModel().getSelected();
    var login=record.get("login");
    var slavePower=record.get("slavePower");
    var taskGroupPower=record.get("taskGroupPower");
    var userType=record.get("userType");
    var userGroupName=record.get("belongToUserGroup");
    var username=record.get("login");
    //用户组选择框
    var taskGroupSelect=generateUserGroupSelect(userGroupName);
    itemArray.push(taskGroupSelect);
    //用户名
    var usernameHidden=new Ext.form.Hidden({
        name:"username",
        value:username
    });
    itemArray.push(usernameHidden);
    //任务组权限
    var grpTaskGroupPower=new Ext.form.RadioGroup({
        name:"grpTaskGroupField",
        fieldLabel:"任务组",
        items:[
            {
                name:"rdaTaskGroup",
                inputValue:1,
                boxLabel:"可操作",
                checked:true
            },
            {
                name:"rdaTaskGroup",
                inputValue:2,
                boxLabel:"只读"
            }
        ]
    })
    grpTaskGroupPower.setValue(taskGroupPower);
    itemArray.push(grpTaskGroupPower);
    //节点权限
    var grpSlavePower=new Ext.form.RadioGroup({
        name:"slavePowerField",
        fieldLabel:"节点",
        items:[
            {
                name:"rdaSlavePower",
                inputValue:1,
                boxLabel:"可操作",
                checked:true
            },
            {
                name:"rdaSlavePower",
                inputValue:2,
                boxLabel:"只读"
            }
        ]
    })
    grpSlavePower.setValue(slavePower);
    itemArray.push(grpSlavePower);
    //用户类型
    var grpUserType=new Ext.form.RadioGroup({
        name:"userType",
        fieldLable:"用户类型",
        items:[
            {
                name:"rdaUserType",
                inputValue:1,
                boxLabel:"管理员",
                checked:true,
                listeners:{
                    'check':function(checkbox,checked){
                        if(checked){
                            if(grpSlavePower && grpTaskGroupPower){
                                grpSlavePower.hide();
                                grpTaskGroupPower.hide();
                            }
                        }
                    }
                }
            },
            {
                name:"rdaUserType",
                inputValue:2,
                boxLabel:"普通用户",
                listeners:{
                    'check':function(checkbox,checked){
                        if(checked){
                            if(grpSlavePower && grpTaskGroupPower){
                                grpSlavePower.show();
                                grpTaskGroupPower.show();
                            }
                        }
                    }
                }
            }
        ]
    })
    grpUserType.setValue(userType);
    itemArray.push(grpUserType);
    //表单
    var allotForm=new Ext.form.FormPanel({
        url:"/user/allotUserGroup.do",
        width:400,
        height:200,
        frame:true,
        labelWidth:60,
        labelAlign:"right",
        items:[
            {
                layout:"form",  //从上往下布局
                items:itemArray
            }
        ]
    });
    //窗口
    var allotWindow=new Ext.Window({
        title:"修改用户组",
        modal:true,
        bodyStyle:"background-color:white",
        width:400,
        height:200,
        items:[
            allotForm
        ],
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"提交",
                handler:function(){
                    allotForm.baseParams=allotForm.getForm().getValues();
                    if(allotForm.getForm().isValid()){
                        allotForm.getForm().submit({
                            success:function(form,action){
                                Ext.MessageBox.alert("成功","分配用户组成功!");
                                allotWindow.close();
                                showUserPanel(secondGuidePanel);
                            },
                            failure:failureResponse
                        })
                    }else{
                        Ext.MessageBox.alert("提交失败","表单存在不规范填写,请再次确认后提交!");
                    }
                }
            }
        ]})
    });
    allotWindow.show(grid);
    if(userType==1){
        grpSlavePower.hide();
        grpTaskGroupPower.hide();
    }
}

//删除用户
function deleteUser(){
    var usersPanel=Ext.getCmp("usersPanel");
    var username=usersPanel.getSelectionModel().getSelected().get("login");
    var userId=usersPanel.getSelectionModel().getSelected().get("userId");
    Ext.Ajax.request({
        url:"/user/deleteUser.do",
        success:function(response,config){
            Ext.MessageBox.alert("success");
            var secondGuidePanel=Ext.getCmp("secondGuidePanel");
            showUserPanel(secondGuidePanel);
        },
        failure:failureResponse,
        params:{username:username,userId:userId}
    })
}

//修改密码
function updatePassword(){
    var usersPanel=Ext.getCmp("usersPanel");
    var userId=usersPanel.getSelectionModel().getSelected().get("userId");
    Ext.Ajax.request({
        url:"/user/getLoginUser.do",
        success:function(response,config){
            var password=Ext.decode(response.responseText).user.password;
            //设置密码框格式
            var dlg = Ext.Msg.getDialog();
            var t = Ext.get(dlg.body).select('.ext-mb-input');
            t.each(function (el) {
                el.dom.type = "password";
            });
            Ext.MessageBox.prompt("密码","为保证数据安全,请验证登录密码:",function(btn,txt){
                if(btn=="ok" && txt==password){
                    var passwordInput=new Ext.form.TextField({
                        name: "password",
                        fieldLabel: "新密码",
                        inputType: 'password',
                        width:150,
                        allowBlank:false,
                        regex:/^[a-zA-Z0-9]{6,10}$/,
                        invalidText:"密码必须在6-10字符",
                        validateOnBlur:true
                    });
                    var repeatPasswordInput=new Ext.form.TextField({
                        name: "repeatPassword",
                        fieldLabel: "确认密码",
                        inputType: 'password',
                        width:150,
                        allowBlank:false,
                        regex:/^[a-zA-Z0-9]{6,10}$/,
                        invalidText:"密码必须在6-10字符",
                        validateOnBlur:true
                    });
                    //表单
                    var userInfoForm=new Ext.form.FormPanel({
                        url:"/user/updatePassword.do",
                        width:300,
                        height:120,
                        frame:true,
                        labelWidth:70,
                        labelAlign:"right",
                        items:[
                            {
                                layout:"form",  //从上往下布局
                                items:[passwordInput,repeatPasswordInput]
                            }
                        ]
                    });
                    var updatePasswordWindow=new Ext.Window({
                        title: "修改密码",
                        modal: true,
                        bodyStyle: "background-color:white",
                        width: 300,
                        height: 135,
                        items: [userInfoForm],
                        tbar:new Ext.Toolbar({buttons:[
                            {
                                text:"修改",
                                handler:function(){

                                    if(userInfoForm.getForm().isValid()){
                                        if(passwordInput.getValue()==repeatPasswordInput.getValue()){
                                            //表单所有控件作为提交参数
                                            var userIdHidden=new Ext.form.Hidden({
                                                name:"userId",
                                                value:userId
                                            });
                                            userInfoForm.items.add(userIdHidden);
                                            userInfoForm.doLayout();
                                            userInfoForm.baseParams=userInfoForm.getForm().getValues();
                                            userInfoForm.getForm().submit({
                                                success:function(form,action){
                                                    Ext.MessageBox.alert("成功","密码修改成功!");
                                                    updatePasswordWindow.close();
                                                    showUserPanel(Ext.getCmp("secondGuidePanel"));
                                                },
                                                failure:failureResponse
                                            })
                                        }else{
                                            Ext.MessageBox.alert("提交失败","两次密码不一致!");
                                            passwordInput.setValue("");
                                            repeatPasswordInput.setValue("");
                                        }
                                    }else{
                                        Ext.MessageBox.alert("提交失败","表单存在不规范填写,请再次确认后提交!");
                                    }
                                }
                            }
                        ]})
                    })
                    updatePasswordWindow.show(usersPanel);
                }else{
                    if(btn=="ok"){
                        Ext.MessageBox.alert("","密码有误,请再次确认!",function(){
                            Ext.getDom("updatePwd").click();
                        });
                    }
                }
            });
        },
        failure:function(){},
        params:{}
    })
}

//用户组选择下拉框
function userGroupCombobox(userGroupName){
    var proxy=new Ext.data.HttpProxy({url:"/userGroup/getUserGrouupSelect.do"});

    var hostName=Ext.data.Record.create([
        {name:"id",type:"String",mapping:"id"},
        {name:"name",type:"String",mapping:"name"},
    ]);

    var reader=new Ext.data.JsonReader({},hostName);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    });

    var userGroupCom=new Ext.form.ComboBox({
        id:"userGroupCombox",
        triggerAction:"all",
        store:store,
        displayField:"id",
        valueField:"name",
        mode:"remote",
        emptyText:"用户组选择",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                showUserPanel(secondGuidePanel);
            }
        }
    })
    if(userGroupName!=undefined && userGroupName!=""){
        userGroupCom.setValue(userGroupName);
        userGroupCom.setRawValue(userGroupName);
    }

    return userGroupCom;
}

//用户类型下拉框
function userTypeCombobox(type){
    var userType=[
        ["管理员","管理员"],
        ["普通用户","普通用户"]
    ]
    var userTypeProxy=new Ext.data.MemoryProxy(userType);

    //下拉列表的数据结构
    var userTypeRecord=Ext.data.Record.create([
        {name:"typeId",type:"string",mapping:0},
        {name:"typeName",type:"string",mapping:1}
    ])
    var reader=new Ext.data.ArrayReader({},userTypeRecord);

    var store=new Ext.data.Store({
        proxy:userTypeProxy,
        reader:reader,
        autoLoad:true
    });
    var typeChooseCom=new Ext.form.ComboBox({
        id:"userTypeCombox",
        triggerAction:"all",
        store:store,
        displayField:"typeName",
        valueField:"typeId",
        mode:"local",
        autoLoad:true,
        emptyText:"用户类型",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                showUserPanel(secondGuidePanel);
            }
        }
    })
    if(type!=undefined && type!=""){
        typeChooseCom.setValue(type);
        typeChooseCom.setRawValue(type);
    }
    return typeChooseCom;

}
