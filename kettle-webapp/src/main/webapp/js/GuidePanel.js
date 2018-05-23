var timeIntervalByTaskControl="";
var loginUserName="";		//当前登录的用户名
var loginUserSlavePower="";	//当前登录的用户对节点的权限
var loginUserTaskGroupPower="";	//当前登录的用户对任务组的权限
var loginUserType="";			//当前登录的用户类型
var belongToUserGroup="";		//所属用户组

//给新创建的任务/转换分配任务组
function assignedTaskGroupByCreate(taskName,type,secondGuidePanel){
	Ext.Ajax.request({
		url:"/task/getJobOrTransByName.do",
		success:function(response,config){
			var result=Ext.decode(response.responseText);
			var grid="";
			if(type=="job"){
				var jobId=result.jobId;
				var jobName=taskName;
				var jobPath=result.directoryName;
				grid=generateAllTaskGroupPanel(jobId,jobPath,jobName,"create");
			}else{
				var transId=result.transformationId;
				var transName=result.name;
				var transPath=result.directoryName;
				grid=AllTaskGroupPanel(transId,transPath,transName,"create");
			}
			var assignedWindowByCreate=new Ext.Window({
				id:"assignedWindowByCreate",
				title:"任务组分配",
				bodyStyle:"background-color:white",
				width:455,
				height:570,
				listeners:{
					"close":function(){
						if(type=="trans"){
							Ext.getCmp("bodyPanelForTrans").enable();
							Ext.getCmp("westTreePanelForTrans").enable();
						}else{
							Ext.getCmp("jobBodyPanel").enable();
							Ext.getCmp("jobWestTreePanel").enable();
						}
					}
				},
				items:[
					grid
				]
			});
			assignedWindowByCreate.show(secondGuidePanel);
		},
		params:{taskName:taskName,type:type}
	})
}

function repositryOpenJob(secondGuidePanel,path,text){
	try {
		Ext.getBody().mask('正在加载，请稍后...', 'x-mask-loading');
		Ext.Ajax.request({
			url: GetUrl('repository/open.do'),
			timeout: 120000,
			params: {path: path, type: 'job'},
			method: 'POST',
			success: function(response, opts) {
				try {
					var jobComponentTree = new Ext.tree.TreePanel({
						id:"jobWestTreePanel",
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

					var graphPanel = Ext.create({repositoryId: path, region: 'center',id:'jobBodyPanel'}, 'JobGraph');
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

	} finally {
		Ext.getBody().unmask();
	}
}

function repositryOpenTrans(secondGuidePanel,path,text){
	try {
		Ext.getBody().mask('正在加载，请稍后...', 'x-mask-loading');
		Ext.Ajax.request({
			url: GetUrl('repository/open.do'),
			timeout: 120000,
			params: {path: path, type: 'transformation'},
			method: 'POST',
			success: function(response, opts) {
				try {
					var transComponentTree = new Ext.tree.TreePanel({
						id:"westTreePanelForTrans",
						region: 'west',
						split: true,
						width: 200,
						title: '核心对象',
						useArrows: true,
						root: new Ext.tree.AsyncTreeNode({text: 'root'}),
						loader: new Ext.tree.TreeLoader({
							dataUrl: GetUrl('system/steps.do')
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

					var treeFilter = new Ext.tree.TreeFilter(transComponentTree, {
						clearBlank : true,
						autoClear : true
					});
					var timeOutId  = null;
					var hiddenPkgs = [];
					var findByKeyWordFiler = function(node, event) {

						clearTimeout(timeOutId);// 清除timeOutId
						transComponentTree.expandAll();// 展开树节点
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
								transComponentTree.root.cascade(function(n) {
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

					var graphPanel = Ext.create({repositoryId: path, region: 'center',id:'bodyPanelForTrans'}, 'TransGraph');
					secondGuidePanel.add({
						layout: 'border',
						items: [transComponentTree, graphPanel]
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
	} finally {
		Ext.getBody().unmask();
	}
}
//transGuidePanel =
//	new Ext.tree.TreePanel({
//		id:'transGuidePanel',
//		title: '核心对象',
//		useArrows: true,
//		//region: 'east',
//		//width:200,
//		enableDD:true,
//		ddGroup:'TreePanelDDGroup',
//		autoScroll: true,
//		animate: false,
//		rootVisible: false,
//		root: new Ext.tree.AsyncTreeNode({text: 'root'}),
//		loader: new Ext.tree.TreeLoader({
//			dataUrl: GetUrl('system/steps.do')
//		})
//
//	});
//
//jobGuidePanel =
//	new Ext.tree.TreePanel({
//		id:'jobGuidePanel',
//		title: '核心对象',
//		useArrows: true,
//		//region: 'east',
//		//width:200,
//		enableDD:true,
//		ddGroup:'TreePanelDDGroup',
//		autoScroll: true,
//		animate: false,
//		rootVisible: false,
//		root: new Ext.tree.AsyncTreeNode({text: 'root'}),
//		loader: new Ext.tree.TreeLoader({
//			dataUrl: GetUrl('system/jobentrys.do')
//		}),
//
//	});

GuidePanel = Ext.extend(Ext.Panel,{
	border:false,
	initComponent: function() {
		var fristGuidePanel="";
		loginUserName=document.getElementById("loginUsername").value;
		loginUserSlavePower=document.getElementById("slavePowerHidden").value;
		loginUserTaskGroupPower=document.getElementById("taskGroupPowerHidden").value;
		loginUserType=document.getElementById("userTypeHidden").value;
		belongToUserGroup=document.getElementById("belongToUserGroup").value;

		fristGuidePanel = new Ext.tree.TreePanel({
			useArrows: true,
			region: 'west',
			width: 200,
			split: true,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode({
				id:'fristGuidePanel',
				children:[
					{
						id:'task',
						cls:'nav-node',
						icon:'ui/images/i_model.png',
						text : "<font size = '3px' style='margin-left:7px'>模&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;型</font>",
						children:[
							{id:"newTrans",text:"<font size = '2px' style='margin-left:9px;'>新建转换</font>",cls:"navl",leaf:true,icon:'ui/images/r_transformation.png'},
							{id:"newJob",text:"<font size = '2px' style='margin-left:9px;'>新建作业</font>",cls:"navl",leaf:true,icon:'ui/images/r_job.png'}
						]
					},{
                        text : "<font size = '3px' style='margin-left:7px'>平&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;台</font>",icon:'ui/images/i_platform.png', cls:'nav-node',
                        children:[
                            {id:"platformMonitor",text:"<font size = '2px' style='margin-left:9px;'>平台概况</font>",cls:"navl",leaf:true,icon:'ui/images/i_platform.png'},
                        ],id:"moduleIdTwo"
                    },{
						text : "<font size = '3px' style='margin-left:7px'>任&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;务</font>",icon:'ui/images/i_task.png', cls:'nav-node',
						children:[
							{id:"jobMonitor",text:"<font size = '2px' style='margin-left:9px;'>作业管理</font>",cls:"navl",leaf:true,icon:'ui/images/i_jobManager.png'},
							{id:"transMonitor",text:"<font size = '2px' style='margin-left:9px;'>转换管理</font>",cls:"navl",leaf:true,icon:'ui/images/i_transManager.png'},
							{id:"taskGroupMonitor",text:"<font size = '2px' style='margin-left:9px;'>任务组管理</font>",cls:"navl",leaf:true,icon:'ui/images/i_taskGroupManager.png'},
							{id:"taskMonitoring",text:"<font size = '2px' style='margin-left:9px;'>任务监控</font>",cls:"navl",leaf:true,icon:'ui/images/i_slaveCon.png'}
						],id:"taskIdTwo"
					},{
                        text : "<font size = '3px' style='margin-left:7px'>定&nbsp;&nbsp;时&nbsp;&nbsp;调&nbsp;&nbsp;度</font>",icon:'ui/images/i_scheduler.png', cls:'nav-node',
                        children:[
                            {id:"schedulerMonitor",text:"<font size = '2px' style='margin-left:9px;'>定时调度管理</font>",cls:"navl",leaf:true,icon:'ui/images/i_timerManager_24.png'},
                        ]
                    },{
						text : "<font size = '3px' style='margin-left:7px'>日&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;志</font>",icon:'ui/images/i_log.png', cls:'nav-node',
						children:[
							{id:"taskLog",text:"<font size = '2px' style='margin-left:9px;'>任务历史日志</font>",cls:"navl",leaf:true,icon:'ui/images/i_tasklog.png'},
						]
					},{
						text : "<font size = '3px' style='margin-left:7px'>节&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;点</font>",icon:'ui/images/i_slave.png', cls:'nav-node',
						children:[
							{id:"slaveMonitor",text:"<font size = '2px' style='margin-left:9px;'>节点管理</font>",cls:"navl",leaf:true,icon:'ui/images/i_slaveManager.png'},
							{id:"slaveMonitoring",text:"<font size = '2px' style='margin-left:9px;'>节点监控</font>",cls:"navl",leaf:true,icon:'ui/images/i_slaveCon.png'},
						]
					},{
						text:"<font size = '3px' style='margin-left:7px'>用&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;户</font>",icon:'ui/images/i_user.png', cls:'nav-node',
						children:[
							{id:"userMonitor",text:"<font size = '2px' style='margin-left:9px;'>用户管理</font>",leaf:true,cls:"navl",icon:'ui/images/i_userManager_16.png'},
							{id:"userGroupMonitor",text:"<font size = '2px' style='margin-left:9px;'>用户组管理</font>",leaf:true,cls:"navl",icon:'ui/images/i_userGroupManager.png'},
						],id:"userIdTwo"
					}
				]
			}),
			enableDD:true,
			ddGroup:'TreePanelDDGroup',
			autoScroll: true,
			animate: false,
			listeners: {
				afterrender: function(node) {
					//fristGuidePanel.expandAll();
					//默认打开作业管理模块
					var rootnodes = fristGuidePanel.getRootNode().childNodes;   //获取主节点
					for(var i=0;i<rootnodes.length;i++){  //从节点中取出子节点依次遍历
						var rootnode = rootnodes[i];
						if(rootnode.id=="moduleIdTwo"){
							rootnode.expand();
							var leafNodes=rootnode.childNodes;
							for(var k=0;k<leafNodes.length;k++){
								var leafNode=leafNodes[k];
								if(leafNode.id=="platformMonitor"){
									leafNode.fireEvent("click",leafNode)
								}
							}
							rootnode.collapse();
						}else if(rootnode.id=="userIdTwo"){
							//根据用户的权限来确认可见的用户模块
							if(loginUserType!=1 && loginUserName!="admin"){
								rootnode.remove();
							}else{
								rootnode.expand();
								var leafNodesU=rootnode.childNodes;
								for(var k=0;k<leafNodesU.length;k++){
									var leafNode=leafNodesU[k];
									if(loginUserName!="admin" && leafNode.id=="userGroupMonitor"){
										leafNode.remove();
									}
								}
								rootnode.collapse();
							}
						}
					}
					rootnodes = fristGuidePanel.getRootNode().childNodes;
					for(var i=0;i<rootnodes.length;i++){  //从节点中取出子节点依次遍历
						var rootnode=rootnodes[i];
						if(rootnode.id=="task"){
							if(loginUserTaskGroupPower!=1 && loginUserName!="admin")
								rootnode.remove();
						}
					}
				}
			},
			rootVisible: false
		});

		var secondGuidePanel = new Ext.Panel({
			region:'center',
			layout:'fit',
			id: 'secondGuidePanel'
			// border: false,
			// bodyStyle : 'background:#CCC'
		});

		fristGuidePanel.on('click', function(node, e) {
			if(timeIntervalByTaskControl!=""){
				clearInterval(timeIntervalByTaskControl);
				timeIntervalByTaskControl="";
			}
			if(moduleViewInterval!=""){
				clearInterval(moduleViewInterval);
				moduleViewInterval="";
			}
			if(node.text == "<font size = '2px' style='margin-left:9px;'>新建转换</font>")
			{
				//设置文本框格式
				var dlg = Ext.Msg.getDialog();
				var t = Ext.get(dlg.body).select('.ext-mb-input');
				t.each(function (el) {
					el.dom.type = "text";
				});
				secondGuidePanel.removeAll(true);
				Ext.Msg.prompt('系统提示', '请输入转换名称:', function(btn, text){
				    if (btn == 'ok' && text != '') {
						var taskGroupPanel=getAllTaskGroupBeforeCreate();
						var addTaskGroupWindow=new Ext.Window({
							title:"分配任务组",
							bodyStyle:"background-color:white",
							width:450,
							modal:true,
							height:550,
							items:[
								taskGroupPanel
							],
							tbar:new Ext.Toolbar({buttons:[
								{
									text:"下一步",
									handler:function(){
										var view=taskGroupPanel.getView();
										var rsm=taskGroupPanel.getSelectionModel();
										var taskGroupNameArray=new Array();
										for(var i=0;i<view.getRows().length;i++) {
											if(rsm.isSelected(i)){
												taskGroupNameArray.push(taskGroupPanel.getStore().getAt(i).get("taskGroupName"));
											}
										}
										if(taskGroupNameArray.length>0){
											addTaskGroupWindow.close();
											Ext.getBody().mask('正在创建转换，请稍后...');
											Ext.Ajax.request({
												url: GetUrl('repository/createTrans.do'),
												method: 'POST',
												params: {dir: '/',transName:text,taskGroupArray:taskGroupNameArray},
												success: function(response) {
													var result=Ext.decode(response.responseText);
													if(result.success==false){
														Ext.getBody().unmask();
														Ext.MessageBox.alert("创建失败",result.message);
													}else{
														var path = Ext.decode(response.responseText).message;
														repositryOpenTrans(secondGuidePanel,path,text)
													}
												},
												failure: failureResponse
											});
										}else{
											Ext.MessageBox.alert("提示","必须为该转换分配至少一个任务组");
											return;
										}
									}
								}
							]})
						});
						addTaskGroupWindow.show(secondGuidePanel);
				    }
				});
			}
			else if(node.text == "<font size = '2px' style='margin-left:9px;'>新建作业</font>")
			{
				secondGuidePanel.removeAll(true);
				//设置文本框格式
				var dlg = Ext.Msg.getDialog();
				var t = Ext.get(dlg.body).select('.ext-mb-input');
				t.each(function (el) {
					el.dom.type = "text";
				});
				Ext.Msg.prompt('系统提示', '请输入作业名称:', function(btn, text){
				    if (btn == 'ok' && text != '') {
						var taskGroupPanel=getAllTaskGroupBeforeCreate();
						var addTaskGroupWindow=new Ext.Window({
							title:"分配任务组",
							bodyStyle:"background-color:white",
							width:450,
							modal:true,
							height:550,
							items:[
								taskGroupPanel
							],
							tbar:new Ext.Toolbar({buttons:[
								{
									text:"下一步",
									handler:function(){
										var view=taskGroupPanel.getView();
										var rsm=taskGroupPanel.getSelectionModel();
										var taskGroupNameArray=new Array();
										for(var i=0;i<view.getRows().length;i++) {
											if(rsm.isSelected(i)){
												taskGroupNameArray.push(taskGroupPanel.getStore().getAt(i).get("taskGroupName"));
											}
										}
										if(taskGroupNameArray.length>0){
											addTaskGroupWindow.close();
											Ext.getBody().mask('正在创建作业，请稍后...');
											Ext.Ajax.request({
												url: GetUrl('repository/createJob.do'),
												method: 'POST',
												params: {dir: '/', jobName: text,taskGroupArray:taskGroupNameArray},
												success: function(response) {
													var result=Ext.decode(response.responseText);
													if(result.success==false){
														Ext.getBody().unmask();
														Ext.MessageBox.alert("创建失败",result.message);
													}else{
														var path = Ext.decode(response.responseText).message;
														repositryOpenJob(secondGuidePanel,path,text);
													}

												},
												failure: failureResponse
											});
										}else{
											Ext.MessageBox.alert("提示","必须为该作业分配至少一个任务组");
											return;
										}
									}
								}
							]})
						});
						addTaskGroupWindow.show(secondGuidePanel);
				    }
				});
			}else if(node.text == "<font size = '2px' style='margin-left:9px;'>作业管理</font>") {
				generateJobPanel(secondGuidePanel);
			}else if(node.text == "<font size = '2px' style='margin-left:9px;'>转换管理</font>") {
				generateTrans(secondGuidePanel);
			}else if(node.text == "<font size = '2px' style='margin-left:9px;'>定时调度管理</font>") {
				generateSchedulerMonitorPanel(secondGuidePanel);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>任务监控</font>"){
				secondGuidePanel.removeAll(true);
				secondGuidePanel.add(showTaskControlPanel());
				secondGuidePanel.doLayout();
				timeIntervalByTaskControl=setInterval("refreshControlPanel()",5000);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>节点管理</font>"){
				slaveManager(secondGuidePanel);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>节点监控</font>"){
				showSlaveMonitorPanel(secondGuidePanel);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>任务组管理</font>"){
				showTaskGroupPanel(secondGuidePanel);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>用户管理</font>"){
				showUserPanel(secondGuidePanel);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>用户组管理</font>"){
				generateUserGroupPanel(secondGuidePanel);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>任务历史日志</font>"){
				showHistoryLogPanel(secondGuidePanel);
			}else if(node.text=="<font size = '2px' style='margin-left:9px;'>平台概况</font>"){
				showModuleView(secondGuidePanel);
			}
		});

		this.items = [fristGuidePanel, secondGuidePanel];
		GuidePanel.superclass.initComponent.call(this);

	}
});
//  TransGuide = Ext.extend(Ext.Panel, {
// //     activeTab: 0,
// //     plain: true,
// 	 layout: 'border',
//
//      initComponent: function() {
//
//      	var transComponentTree = new Ext.tree.TreePanel({
//      		region: 'west',
//      		split: true,
//      		width: 200,
//
//      		title: '核心对象',
//      		useArrows: true,
//      		root: new Ext.tree.AsyncTreeNode({text: 'root'}),
//      		loader: new Ext.tree.TreeLoader({
//      			dataUrl: GetUrl('system/steps.do')
//      		}),
//      		enableDD:true,
//      		ddGroup:'TreePanelDDGroup',
//      		autoScroll: true,
//      		animate: false,
//      		rootVisible: false
//      	});
//
// //     	var jobComponentTree = new Ext.tree.TreePanel({
// //     		title: '核心对象',
// //     		useArrows: true,
// //     		root: new Ext.tree.AsyncTreeNode({text: 'root'}),
// //     		loader: new Ext.tree.TreeLoader({
// //     			dataUrl: GetUrl('system/jobentrys.do')
// //     		}),
// //     		enableDD:true,
// //     		ddGroup:'TreePanelDDGroup',
// //     		autoScroll: true,
// //     		animate: false,
// //     		rootVisible: false
// //     	});
// //     	this.activeCom = function(item) {
// //     		this.remove(transComponentTree, false);
// //     		this.remove(jobComponentTree, false);
// //     		jobComponentTree.hide();
// //     		transComponentTree.hide();
// //
// //     		if(item && item.getXType() == 'JobGraph') {
// //     			jobComponentTree.show();
// //     			this.add(jobComponentTree);
// //     			this.setActiveTab(jobComponentTree.getId());
// //     		} else if(item && item.getXType() == 'TransGraph') {
// //     			transComponentTree.show();
// //     			this.add(transComponentTree);
// //     			this.setActiveTab(transComponentTree.getId());
// //     		}
// //     	};
//
// //         jobComponentTree.on("nodedragover", function(e){
// //         	return false;
// //         });
//
// //         transComponentTree.on("nodedragover", function(e){
// //         	return false;
// //         });
//
// //         var repositoryTree = new RepositoryManageTree({title: '资源库'});
//
//          this.items = [transComponentTree, {
//
//          }];
//
//          TransGuide.superclass.initComponent.call(this);
//
//      }
//  });
