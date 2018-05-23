var activeGraph = null;

// ajax回调函数处理session过期
Ext.Ajax.on('requestcomplete',checkUserSessionStatus, this);
function checkUserSessionStatus(conn,response,options){
	var status = response.getResponseHeader("sessionstatus");
	//Ext重新封装了response对象
	if(status=="timeout"){
		alert("会话超时或用户状态发生改变,请重新登录!");
		window.location.href="/login.jsp";
	}
}
//退出登录
function loginOut(){
	window.location.href = 'user/loginOut.do';
}
//修改当前用户密码
function updateThisPwd(){
	Ext.Ajax.request({
		url:"/user/getLoginUser.do",
		success:function(response,config){
			var loginUser=Ext.decode(response.responseText).user
			var password=loginUser.password;
			var userId=loginUser.userId;
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
												},
												failure:function(){
													Ext.MessageBox.alert("失败","服务器异常,请稍后再试!");
												}
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
					updatePasswordWindow.show(Ext.getCmp("secondGuidePanel"));
				}else{
					if(btn=="ok"){
						Ext.MessageBox.alert("","密码有误,请再次确认!",function(){
							Ext.getDom("updateThisPw").click();
						});
					}
				}
			});
		},
		failure:function(){},
		params:{}
	})
}

Ext.onReady(function() {

	Ext.QuickTips.init();
	Ext.MessageBox.buttonText.yes = '确定';
	Ext.MessageBox.buttonText.ok = '好的';
	Ext.MessageBox.buttonText.no = '否';
	Ext.MessageBox.buttonText.cancel = '取消';

	var init= function() {
//		var tabPanel = new Ext.TabPanel({
//			id: 'TabPanel',
//			region: 'center',
//			border: true,
//			collapsible:true
//		});

		var username=document.getElementById("loginUsername").value;
		var loginInfo=//"<div style='display:inline-block;height:100%'><img src='../ui/images/i_headerLogo.png' style='margin:14px 40px;'/></div>" +
			"<div class='header-button-Cls header-public-display'>"+
			"<span onclick='loginOut()' class='header-operation-Cls'>退出登录</span><span class='header-split-Cls'>|</span><span onclick='updateThisPwd()' class='header-operation-Cls' id='updateThisPw'>修改密码</span></div>"+
			"<div style='margin-bottom:5px;display: inline-block' class='header-loginInfo-Cls header-public-display'>欢迎您："+username+"</div>";
		var navigationPanel = new Ext.Panel({
			id: 'navigationPanel',
			region: 'north',
			height:90,
			border: false,
			html:loginInfo,
			margin: '0,0,0,0',
			bodyStyle: {
				background: 'url(../ui/images/i_headerBGI.png) no-repeat'
			}
		});
		var footPanel = new Ext.Panel({
			id: 'footPanel',
			region: 'south',
			height: 30,
			border: false,
			margin: '0,0,0,0',
			bodyStyle: {
				background: 'url(../ui/images/i_footColor.png) no-repeat'
			}
		});


		var guidePanel = new GuidePanel({
			id: 'GuidePanel',
//			split: true,
			region: 'center',
//			width: 400,
			layout: 'border'//,
//			items:[
//				fristGuidePanel,
//				secondGuidePanel,
//			]
			
		});


		/*tabPanel.on('tabchange', function(me, item) {
			if(item) {
				activeGraph = item;
				//guidePanel.activeCom(item);
				//secondGuidePanel.activeCom(item);
			} else {
				activeGraph = null;
				//guidePanel.activeCom(null);
				//secondGuidePanel.activeCom(null);
			}
		});*/

	    new Ext.Viewport({
			layout: 'border',
			items: [navigationPanel,guidePanel,footPanel]
		});
	};
	
//	Ext.Ajax.request({
//		url: GetUrl('system/getSystem.do'),
//		success: function(response) {
//			if(response.responseText == 'access forbidden') {
//				var dialog = new RepositoriesDialog();
//				dialog.on('loginSuccess', function() {
//					dialog.close();
//					init();
//				});
//				dialog.show();
//			} else {
//				init();
//			}
//			
//		    setTimeout(function(){
//		    	Ext.get('loading').hide();
//		        Ext.get('loading-mask').fadeOut();
//		    }, 250);
//		}
//	});

	 init();

	 setTimeout(function(){
		 Ext.get('loading').hide();
		 Ext.get('loading-mask').fadeOut();
		 moduleViewData();
	 }, 250);

});

// function treeClick(node,e) {
// 	//判断是否是叶子节点
// 	if(node.leaf){
// 		var nodeId=node.id;
// 		//如果点击的是作业管理节点 并且作业板块未曾打开过则生成一个作业的panel
// 		if(nodeId=='jobMonitor' && !Ext.getCmp("JobPanel")){
// 			generateJobPanel();
// 		};
// 		if(nodeId=='transMonitor' && !Ext.getCmp("transPanel")){
// 			generateTrans();
// 		}
// 	}
// }

// function treeClick(node, e) {
// 	if (node.isLeaf()) {
//
// 		if(node.id=='newTrans'){
//
// 			var guide =  Ext.getCmp('secondGuidePanel');
// 			guide.removeAll();
// 			guide.add('transGuidePanel');
// 			guide.doLayout();
// 			//secondGuidePanel.show();
//
// 		}else if(node.id=='newJob'){
// 			var guide =  Ext.getCmp('secondGuidePanel');
// 			guide.removeAll();
// 			guide.add('jobGuidePanel');
// 			guide.doLayout();
// 			//secondGuidePanel.show();
// 		}
// 	}
// }

//fristGuidePanel.on('click', treeClick);


function syncCall(cfg) {
	var conn = null;
	try {
		conn = new XMLHttpRequest();
    } catch(e) {
        for (var i = Ext.isIE6 ? 1 : 0; i < activeX.length; ++i) {
            try {
            	conn = new ActiveXObject(activeX[i]);
                break;
            } catch(e) {
				
            }
        }
    }
    var jsonData = cfg.params || {};
    var p = Ext.isObject(jsonData) ? Ext.urlEncode(jsonData) : jsonData;
    
    var url = cfg.url;
    url = Ext.urlAppend(url, p);
    
    conn.open(cfg.method || 'POST', url, false);
    conn.send(null);
    if (conn.status == "200") {  
    	return conn.responseText;  
    }  
    return null;
}

Ext.override(Ext.util.MixedCollection, {
	getString: function(str, key) {
		return this.get(key);
	}
});

var loadCache = new Ext.util.MixedCollection();
var BaseMessages = new Ext.util.MixedCollection(), PKG = null;
function loadPluginScript(pluginId) {
	if(!pluginId) return;
	
	if(!loadCache.containsKey(pluginId)) {
		var oHead = document.getElementsByTagName('HEAD').item(0);
	    var oScript= document.createElement("script");
	    oScript.type = "text/javascript";
	    oScript.src = GetUrl('ui/stepjs/' + pluginId + '.js2');
	    oHead.appendChild( oScript ); 
		
		loadCache.add(pluginId, 1);
	}
}

function findItems(c, name, v) {
	var arrays = [];
	if(c.items) {
		c.items.each(function(t) {
			if(t[name] == v)
				arrays.push(t);
			Ext.each(findItems(t, name, v), function(e) {
				arrays.push(e);
			});
		});
	}
	return arrays;
}

function getActiveGraph() {
	return activeGraph;
}

function decodeResponse(response, cb, opts) {
	try {
		var resinfo = Ext.decode(response.responseText);
		if(resinfo.success) {
			cb(resinfo);
		} else {
			Ext.Msg.show({
			   title: resinfo.title,
			   msg: resinfo.message,
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.ERROR
			});
		}
		Ext.getBody().unmask();
	} finally {
		Ext.getBody().unmask();
	}
}

function failureResponse(response) {
	Ext.getBody().unmask();
	if(response.status == 0 && !response.responseText) {
		Ext.Msg.show({
		   title: '系统提示',
		   msg: '服务器繁忙或宕机，请确认服务器状态！',
		   buttons: Ext.Msg.OK,
		   icon: Ext.MessageBox.WARNING
		});
	} else if(response.status == 500) {
		var noText = Ext.MessageBox.buttonText.no;
		Ext.MessageBox.buttonText.no = '查看详细';
		Ext.Msg.show({
		   title: '系统提示',
		   msg: '系统发生错误！错误信息：' + response.statusText,
		   buttons: Ext.Msg.YESNOCANCEL,
		   fn: function(bId) {
			   Ext.MessageBox.buttonText.no = noText;
			   if(bId == 'no') {
				   var win = new Ext.Window({
					   width: 1000,
					   height: 600,
					   title: '详细错误',
					   modal: true,
					   layout: 'fit',
					   items: new Ext.form.TextArea({
						   	value: decodeURIComponent(response.responseText),
							readOnly : true
					   }),
					   bbar: ['->', {
						   text: '确定', handler: function() {win.close();}
					   }]
				   });
				   win.show();
			   }
		   },
		   icon: Ext.MessageBox.ERROR
		});
	}
}

mxPopupMenu.prototype.zIndex = 100000;

mxGraph.prototype.isHtmlLabel = function(	cell	) {
	return true;
}

function NoteShape()
{
	mxCylinder.call(this);
};
mxUtils.extend(NoteShape, mxCylinder);
NoteShape.prototype.size = 10;
NoteShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
	var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size)));

	if (isForeground)
	{
		path.moveTo(w - s, 0);
		path.lineTo(w - s, s);
		path.lineTo(w, s);
		path.end();
	}
	else
	{
		path.moveTo(0, 0);
		path.lineTo(w - s, 0);
		path.lineTo(w, s);
		path.lineTo(w, h);
		path.lineTo(0, h);
		path.lineTo(0, 0);
		path.close();
		path.end();
	}
};

mxCellRenderer.prototype.defaultShapes['note'] = NoteShape;

NoteShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
                                   new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                   new mxConnectionConstraint(new mxPoint(0.75, 0), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.25), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.5), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.75), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.25), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.5), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.75), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.25, 1), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.5, 1), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.75, 1), true)];

Ext.override(Ext.data.Store, {
	toArray: function(fields) {
		var data = [];
		this.each(function(rec) {
			var obj = new Object();
			Ext.each(fields, function(field) {
				if(Ext.isString(field))
					obj[field] = rec.get(field);
				else if(Ext.isObject(field)) {
					if(field.value)
						obj[field.name] = field.value;
					else
						obj[field.name] = rec.get(field.field);
				}
			});
			data.push(obj);
		});
		return data;
	},
	toJson: function() {
		var data = [];
		this.each(function(rec) {
			var obj = new Object();
			rec.fields.each(function(field) {
				obj[field.name] = rec.get(field.name);
			});
			data.push(obj);
		});
		return data;
	},
	merge: function(store, fields) {
		var me = this;
		if(store.getCount() <= 0) return;
		var data = store.toArray(fields);
		
		if(this.getCount() > 0) {
			var answerDialog = new AnswerDialog({has: me.getCount(), found: data.length});
			answerDialog.on('addNew', function() {
				me.loadData(data, true);
			});
			answerDialog.on('addAll', function() {
				Ext.each(data, function(d) {
	                var record = new store.recordType(d);
	                me.insert(0, record);
				});
			});
			answerDialog.on('clearAddAll', function() {
				me.removeAll();
				me.loadData(data);
			});
			answerDialog.show();
		} else {
			me.loadData(data);
		}
	}
});




//fristGuidePanel.addListener('click', treeClick);

