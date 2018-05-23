//作业面板
function generateJobPanel(secondGuidePanel){
    //为表格添加一行复选框用于选择行
    var sm=new Ext.grid.CheckboxSelectionModel();

    //列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm,
        {header:"id",dataIndex:"jobId",align:"center"},
        {header:"目录",width:150,dataIndex:"directoryName",align:"center"},
        {header:"名字",width:150,dataIndex:"name",align:"center"},
        {header:"创建用户",width:100,dataIndex:"createUser",align:"center"},
        {header:"创建时间",width:130,dataIndex:"createDate",tooltip:"这是创建时间",format:"y-M-d H:m:s",align:"center"},
        {header:"最终修改者",width:100,dataIndex:"modifiedUser",align:"center"},
        {header:"修改时间",width:130,dataIndex:"modifiedDate",format:"y-M-d H:m:s",align:"center"},
        {header:"所属任务组",dataIndex:"belongToTaskGroup",align:"center"},
        {header:"操作",width:280,dataIndex:"",menuDisabled:true,align:"center",
            renderer:function(v){
                if(loginUserTaskGroupPower==1 || loginUserName=="admin"){
                    return "<img src='../../ui/images/i_delete.png' class='imgCls' onclick='deleteJobByJobPath()' title='删除作业'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_detail.png' class='imgCls' onclick='showOneJobDetail()' title='作业属性'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_editor.png' class='imgCls' onclick='editorJob()' title='编辑'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_updateTaskName.png' class='imgCls' onclick='updateJobName()' title='修改作业名'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_compositionImg.png' class='imgCls' onclick='jobCompositionImg()'  title='结构图'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_execute.png' class='imgCls' onclick='executeJob()' title='执行作业配置'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_timer.png' class='imgCls' onclick='beforeSchedulerJob()' title='定时执行'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_assigned.png' class='imgCls' onclick='beforeAssignedTaskGroup()' title='分配任务组'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_power.png' class='imgCls' onclick='jobPowerExecute()' title='智能执行'/>&nbsp;&nbsp;";
                }else{
                    return "<img src='../../ui/images/i_detail.png' class='imgCls' onclick='showOneJobDetail()' title='作业属性'/>&nbsp;&nbsp;"+
                        "<img src='../../ui/images/i_compositionImg.png' class='imgCls' onclick='jobCompositionImg()' title='结构图'/>";
                }
            }
        }
    ]);

    //准备数据 使用HttpProxy方式从后台获取json格式的数据
    var proxy=new Ext.data.HttpProxy({url:"/task/getJobs.do"});

    //Record定义记录结果
    var human=Ext.data.Record.create([
        {name:"jobId",type:"string",mapping:"jobId"},
        {name:"directoryName",type:"string",mapping:"directoryName"},
        {name:"name",type:"string",mapping:"name"},
        {name:"createUser",type:"string",mapping:"createUser"},
        {name:"createDate",type:"string",mapping:"createDate"},
        {name:"modifiedUser",type:"string",mapping:"modifiedUser"},
        {name:"modifiedDate",type:"string",mapping:"modifiedDate"},
        {name:"belongToTaskGroup",type:"string",mapping:"belongToTaskGroup"}
    ])
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},human);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader,
        listeners: {
            "beforeload": function(store) {
                var jobName="";
                var createDate="";
                if(Ext.getCmp("jobNameForSearch")!=undefined){
                    jobName=Ext.getCmp("jobNameForSearch").getValue();
                    createDate=Ext.getCmp("createDateForSearch").getValue();
                }
                store.baseParams = {
                    name:jobName,
                    date:createDate
                }
            }
        }
    })
    store.load({params:{start:0,limit:15}});

    var inputJobName="";
    if(Ext.getCmp("jobNameForSearch")!=undefined){
        inputJobName=Ext.getCmp("jobNameForSearch").getValue();
    }
    var nameField=new Ext.form.TextField({
        id: "jobNameForSearch",
        fieldLabel: "作业名",
        width:120,
        value:inputJobName,
        emptyText:"请输入作业名.."
    })
    var dateField=new Ext.form.DateField({
        id: "createDateForSearch",
        fieldLabel: "创建日期",
        emptyText:"请选择创建日期..",
        width: 120,
        format: "Y-m-d"
    })

    var grid=new Ext.grid.GridPanel({
        id:"JobPanel",
        title:"<font size = '3px' >作业管理</font>  ",
        height:470,
        cm:cm,      //列模型
        sm:sm,
        store:store,
        closable:true,
        tbar:new Ext.Toolbar({
            buttons:[
                nameField ,"-",dateField,
                {
                    iconCls:"searchCls",
                    tooltip: '查询',
                    handler:function(){
                        generateJobPanel(secondGuidePanel);
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
    grid.getColumnModel().setHidden(9,true);
    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(grid);
    secondGuidePanel.doLayout();
}

//定时执行作业前
function beforeSchedulerJob(){
    var grid=Ext.getCmp("JobPanel");
    var fiexdWindow=fixedExecuteWindow("添加",new Array(),"/task/beforeFiexdExecute.do");
    fiexdWindow.show(grid);
}

//执行作业
function executeJob(){
    var grid=Ext.getCmp("JobPanel");
    var path=grid.getSelectionModel().getSelected().get("directoryName");
    Ext.Ajax.request({
        url: GetUrl('task/detail.do'),
        method: 'POST',
        params: {taskName: path,type:'job'},
        success: function(response) {
            var resObj = Ext.decode(response.responseText);
            var graphPanel = Ext.create({border: false, Executable: true},resObj.GraphType);
            var dialog = new LogDetailDialog({
                items: graphPanel,
                title:"执行作业配置"
            });
            activeGraph = graphPanel;
            dialog.show(null, function() {
                var xmlDocument = mxUtils.parseXml(decodeURIComponent(resObj.graphXml));
                var decoder = new mxCodec(xmlDocument);
                var node = xmlDocument.documentElement;
                var graph = graphPanel.getGraph();
                decoder.decode(node, graph.getModel());
                graphPanel.setTitle(graph.getDefaultParent().getAttribute('name'));
            });
        }
    });
}

//智能执行作业
function jobPowerExecute(){
    var grid=Ext.getCmp("JobPanel");
    var path=grid.getSelectionModel().getSelected().get("directoryName");
    Ext.MessageBox.confirm("确认","确认执行?",function(btn){
        if(btn=="yes"){
            powerExecute(path,"job");
        }else{
            return;
        }
    })
}

//结构图
function jobCompositionImg(){
    var grid=Ext.getCmp("JobPanel");
    var taskName=grid.getSelectionModel().getSelected().get("directoryName");//被选中的任务路径
    Ext.Ajax.request({
        url: GetUrl('task/detail.do'),
        method: 'POST',
        params: {taskName: taskName,type:'job'},
        success: function(response) {
            var resObj = Ext.decode(response.responseText);
            var graphPanel = Ext.create({border: false, readOnly: true }, resObj.GraphType);
            var dialog = new LogDetailDialog({
                items: graphPanel,
                title:"结构图"
            });
            dialog.show(null, function() {
                var xmlDocument = mxUtils.parseXml(decodeURIComponent(resObj.graphXml));
                var decoder = new mxCodec(xmlDocument);
                var node = xmlDocument.documentElement;
                var graph = graphPanel.getGraph();
                decoder.decode(node, graph.getModel());
                graphPanel.setTitle(graph.getDefaultParent().getAttribute('name'));
            });
        }
    });
}

//编辑作业
function editorJob(){
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    var grid=Ext.getCmp("JobPanel");
    var path=grid.getSelectionModel().getSelected().get("directoryName");

    secondGuidePanel.removeAll(true);
    Ext.Ajax.request({
        url: GetUrl('repository/open.do'),
        timeout: 120000,
        params: {path: path, type: 'job'},
        method: 'POST',
        success: function(response, opts) {
            try {

                var jobComponentTree = new Ext.tree.TreePanel({
                    region: 'west',
                    split: true,
                    width: 200,

                    title: '核心对象',
                    useArrows: true,
                    root: new Ext.tree.AsyncTreeNode({text: 'root'}),
                    loader: new Ext.tree.TreeLoader({
                        dataUrl: GetUrl('system/jobentrys.do')
                    }),
                    enableDD:true,
                    ddGroup:'TreePanelDDGroup',
                    autoScroll: true,
                    animate: false,
                    rootVisible: false,
                    tbar:[
                        new Ext.form.TextField({
                            width:150,
                            emptyText:'请输入关键字检索',
                            enableKeyEvents: true,
                            listeners:{
                                keyup:function(node, event) {
                                    findByKeyWordFiler(node, event);
                                },
                                scope: this
                            }
                        })
                    ]
                });

                var treeFilter = new Ext.tree.TreeFilter(jobComponentTree, {
                    clearBlank : true,
                    autoClear : true
                });
                var timeOutId  = null;
                var hiddenPkgs = [];

                var findByKeyWordFiler = function(node, event) {

                    clearTimeout(timeOutId);// 清除timeOutId
                    jobComponentTree.expandAll();// 展开树节点
                    // 为了避免重复的访问后台，给服务器造成的压力，采用timeOutId进行控制，如果采用treeFilter也可以造成重复的keyup
                    timeOutId = setTimeout(function() {
                        // 获取输入框的值
                        var text = node.getValue();
                        // 根据输入制作一个正则表达式，'i'代表不区分大小写
                        var re = new RegExp(Ext.escapeRe(text), 'i');
                        // 先要显示上次隐藏掉的节点
                        Ext.each(hiddenPkgs, function(n) {
                            n.ui.show();
                        });
                        hiddenPkgs = [];
                        if (text != "") {
                            treeFilter.filterBy(function(n) {
                                // 只过滤叶子节点，这样省去枝干被过滤的时候，底下的叶子都无法显示
                                return !n.isLeaf() || re.test(n.text);
                            });
                            // 如果这个节点不是叶子，而且下面没有子节点，就应该隐藏掉
                            jobComponentTree.root.cascade(function(n) {
                                if(n.id!='0'){
                                    if(!n.isLeaf() &&judge(n,re)==false&& !re.test(n.text)){
                                        hiddenPkgs.push(n);
                                        n.ui.hide();
                                    }
                                }
                            });
                        } else {
                            treeFilter.clear();
                            return;
                        }
                    }, 500);
                }

                // 过滤不匹配的非叶子节点或者是叶子节点
                var judge =function(n,re){
                    var str=false;
                    n.cascade(function(n1){
                        if(n1.isLeaf()){
                            if(re.test(n1.text)){ str=true;return; }
                        } else {
                            if(re.test(n1.text)){ str=true;return; }
                        }
                    });
                    return str;
                };

                var graphPanel = Ext.create({repositoryId: path, region: 'center'}, 'JobGraph');

                secondGuidePanel.add({
                    layout: 'border',
                    items: [jobComponentTree, graphPanel]
                });
                secondGuidePanel.doLayout();

                activeGraph = graphPanel;


                var xmlDocument = mxUtils.parseXml(decodeURIComponent(response.responseText));
                var decoder = new mxCodec(xmlDocument);
                var node = xmlDocument.documentElement;

                var graph = graphPanel.getGraph();
                decoder.decode(node, graph.getModel());

                graphPanel.fireEvent('load');
            } finally {
                Ext.getBody().unmask();
            }
        },
        failure: failureResponse
    });
}

//删除作业
function deleteJobByJobPath(){
    var grid=Ext.getCmp("JobPanel");
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    var jobPath=grid.getSelectionModel().getSelected().get("directoryName");
    Ext.MessageBox.confirm("确认","确认删除该作业?",function(btn){
        if(btn=="yes"){
            Ext.Ajax.request({
                url:"/task/delete.do",
                success:function(response,config){
                    generateJobPanel(secondGuidePanel);
                    Ext.MessageBox.alert("提示","删除作业成功~!");
                },
                failure:failureResponse,
                params:{path:jobPath,flag:"job"}
            })
        }
    })
}

//显示作业的详细信息
function showOneJobDetail(){
    var transGrid=Ext.getCmp("JobPanel");
    var record=transGrid.getSelectionModel().getSelected();
    var thisBelongToTaskGroup=record.get("belongToTaskGroup");
    var thisName=record.get("name");
    //拼接窗口所需要显示的内容
    var htmlInfo="<table cellpadding='0' cellspacing='0' width='440' bgcolor='white' border='1'>"
    if(thisBelongToTaskGroup!=undefined && thisBelongToTaskGroup.trim()!=""){
        var taskGroupArray=new Array();
        taskGroupArray=thisBelongToTaskGroup.split(",");

        for(var i=0;i<taskGroupArray.length;i++){
            if(i==0)
                htmlInfo+="<tr><td align='center' rowspan='"+taskGroupArray.length+"'>所属任务组</td>"
            else
                htmlInfo+="<tr>"
            htmlInfo+="<td align='center'>"+taskGroupArray[i]+"</td></tr>"
        }
    }else{
        htmlInfo+="<tr><td align='center'>所属任务组</td><td align='center'>暂未分配任务组</td></tr>";
    }
    htmlInfo+="</table>"
    var oneJobDetailWindow=new Ext.Window({
        id:"oneJobDetailWindow",
        title:thisName,
        bodyStyle:"background-color:white",
        width:455,
        modal:true,
        html:htmlInfo
    });
    oneJobDetailWindow.show(transGrid);
}

//获得被选中的作业的id 全目录名 作业名等信息
function getJobInfo(){
    var result=new Array();
    var jobId=0;
    var jobName="";
    var jobPath="";
    var grid=Ext.getCmp("JobPanel");
    var view=grid.getView();
    var rsm=grid.getSelectionModel();
    for(var i= 0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            //获取被选中的转换全目录路径
            jobPath=grid.getStore().getAt(i).get("directoryName");
            jobId=grid.getStore().getAt(i).get("jobId");
            jobName=grid.getStore().getAt(i).get("name");
            result.push(jobId);
            result.push(jobName);
            result.push(jobPath);
        }
    }
    return result;
}

//分配任务组     获取参数
function beforeAssignedTaskGroup(){
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    var grid=Ext.getCmp("JobPanel");
    var record=grid.getSelectionModel().getSelected();
    var jobId=record.get("jobId");
    var jobPath=record.get("directoryName");
    var jobName=record.get("name");
    showWindowByAssigned(jobId,jobPath,jobName,grid);
}

//展示分配任务组的窗口
function showWindowByAssigned(jobId,jobPath,jobName,grid){
    var panelByAssigned=generateAllTaskGroupPanel(jobId,jobPath,jobName);
    var taskGroupAssignedWindow=new Ext.Window({
        id:"taskGroupAssignedWindow",
        title:"<font size = '2.5px' >任务组分配</font>",
        bodyStyle:"background-color:white",
        width:455,
        height:570,
        modal:true,
        items:[
            panelByAssigned
        ]
    });
    taskGroupAssignedWindow.show(grid);
}

//获取该用户下的所有任务组  并且设置任务组是否包含该任务的标识
function generateAllTaskGroupPanel(jobId,jobPath,jobName){
    var sm2=new Ext.grid.CheckboxSelectionModel();
    //节点列模型
    var taskGroupModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"任务组ID",dataIndex:"taskGroupId"},
        {header:"isContainsTask",dataIndex:"isContainsTask"},
        {header:"任务组名",dataIndex:"taskGroupName"},
        {header:"任务组描述",dataIndex:"taskGroupDesc"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/taskGroup/isContainsTaskBeforeAssigned.do"});

    var taskGroupRecord=Ext.data.Record.create([
        {name:"taskGroupId",type:"string",mapping:"taskGroupId"},
        {name:"isContainsTask",type:"string",mapping:"isContainsTask"},
        {name:"taskGroupName",type:"string",mapping:"taskGroupName"},
        {name:"taskGroupDesc",type:"string",mapping:"taskGroupDesc"}
    ])
    var reader=new Ext.data.JsonReader({},taskGroupRecord);
    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load({params:{name:jobName,type:"job"}});

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
        },
        tbar:new Ext.Toolbar({
            buttons: [
                {
                    text:"确认",
                    handler:function(){
                        assignedTaskGroup(jobId,jobName,jobPath,taskGroupPanelByAssigned);
                    }
                }
            ]
        })
    });
    //监听事件 panel数据加载完毕后执行
    taskGroupPanelByAssigned.store.on("load",function(store) {
        //遍历所有任务组 判断是否包含了用户选中的任务 如果包含则选中该行
        var view=taskGroupPanelByAssigned.getView();
        var rsm=taskGroupPanelByAssigned.getSelectionModel();
        var chooseIndex=new Array();
        for(var i= 0;i<view.getRows().length;i++){
            var isContains=taskGroupPanelByAssigned.getStore().getAt(i).get("isContainsTask");
            //标识符为Y代表该任务组包含了用户选中的任务 则选中该行
            if(isContains=="YES"){
                chooseIndex.push(i);
            }
        }
        rsm.selectRows(chooseIndex,true);
    },taskGroupPanelByAssigned);
    //隐藏第二列和第三列
    taskGroupPanelByAssigned.getColumnModel().setHidden(2,true);
    taskGroupPanelByAssigned.getColumnModel().setHidden(3,true);
    return taskGroupPanelByAssigned;
}

//访问后台分配任务组
function assignedTaskGroup(jobId,jobName,jobPath,taskGroupPanelByAssigned){
    var view=taskGroupPanelByAssigned.getView();
    var rsm=taskGroupPanelByAssigned.getSelectionModel();
    var taskGroupNameArray=new Array();
    for(var i= 0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            taskGroupNameArray.push(taskGroupPanelByAssigned.getStore().getAt(i).get("taskGroupName"));
        }
    }
    if(taskGroupNameArray.length>0){
        Ext.Ajax.request({
            url:"/taskGroup/assignedTaskGroup.do",
            success:function(response,config){
                Ext.MessageBox.alert("任务组分配成功!");
                var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                Ext.getCmp("taskGroupAssignedWindow").close();
                generateJobPanel(secondGuidePanel);
            },
            failure:failureResponse,
            params:{taskId:jobId,taskName:jobName,taskPath:jobPath,type:"job",taskGroupNameArray:taskGroupNameArray}
        })
    }else{
        Ext.MessageBox.alert("必须为该作业分配至少一个任务组");
    }
}

//修改作业名
function updateJobName(){
    var grid=Ext.getCmp("JobPanel");
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    var oldName=grid.getSelectionModel().getSelected().get("name");
    //设置文本框格式
    var dlg = Ext.Msg.getDialog();
    var t = Ext.get(dlg.body).select('.ext-mb-input');
    t.each(function (el) {
        el.dom.type = "text";
    });
    Ext.Msg.prompt('修该作业名', '请输入新的作业名称:', function(btn, text) {
        if (btn == 'ok' && text != '') {
            Ext.Ajax.request({
                url:"/task/updateTaskName.do",
                success:function(response,config){
                    if(response.responseText=="OK"){
                        generateJobPanel(secondGuidePanel);
                        Ext.MessageBox.alert("提示","修改作业名成功!");
                    }else{
                        Ext.MessageBox.alert("修改失败","该作业名已存在!");
                    }
                },
                failure:failureResponse,
                params:{oldName:oldName,newName:text,type:"job"}
            })
        }
    })
}



