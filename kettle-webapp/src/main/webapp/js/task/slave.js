
//生成执行功能弹窗
function generateSlaveWindow(path,flag2){
    var executeWindow=new Ext.Window({
        title:"执行窗口",
        width:600,
        height:310,
        id:"executeWindow"
    })
    var tbar= new Ext.Toolbar({
        buttons:[
            {
                text:"取消",
                handler:function(){
                    executeWindow.close();
                }

            },"-",
            {
                text:"确认执行",
                handler:function(){
                    var resultArrya=ifSlaveChoose();
                    if(resultArrya[0]==0){
                        Ext.MessageBox.alert("提示","请至少选择一个正常节点再执行转换!");
                        return;
                    }else if(resultArrya[0]>1){
                        Ext.MessageBox.alert("提示","只能选中一个节点进行运行");
                        return;
                    }else if(resultArrya[0]==-1){
                        Ext.MessageBox.alert("提示","该节点异常,请重新选择!");
                        return;
                    }else if(resultArrya[0]==1){
                        Ext.Ajax.request({
                            url:"/task/execute.do",
                            success:function(response,config){
                                Ext.MessageBox.alert("result","已执行");
                                setTimeout("closeWindwo()",1500);
                            },
                            failure:failureResponse,
                            params:{path:path,slaveId:resultArrya[1],flag:flag2}
                        })
                    }
                }
            }
        ]
    })
    //给节点列表添加功能按钮
    var slaveGridPanel=getSlaveGridPanel(300,tbar);
    //把展示节点的panel追加窗口中
    executeWindow.add(slaveGridPanel);
    return executeWindow;
}

//获得节点的列表panel
function getSlaveGridPanel(h,tbar){
    if(tbar==""){
        tbar=new Ext.Toolbar({
            buttons:[
            ]
        })
    }

    var sm2=new Ext.grid.CheckboxSelectionModel();
    //节点列模型
    var slaveModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"ID",width:55,dataIndex:"slaveId"},
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
        id:"slaveGridPanel",
        title:"选择节点",
        width:590,
        height:h,
        cm:slaveModel,      //列模型
        sm:sm2,      //行选择框
        store:store,    //数据源
        closable:true,
        tbar:tbar
    })
    return slaveGridPanel;
}

//判断用户是否选中了正常节点
function ifSlaveChoose(){
    var slaveGridPanel=Ext.getCmp("slaveGridPanel");
    var view=slaveGridPanel.getView();
    var rsm=slaveGridPanel.getSelectionModel();
    var flag=false;
    var j=0;
    var slaveId="";     //节点id
    var status="";      //节点状态
    var result=new Array();     //返回的结果 数组中第一个将会存放用户选择的节点数,0代表没有选择节点 -1代表选择了不正常节点
                                //如果刚好选择了一个正常节点,则会把节点ID存放在数组的第二个位置
    //遍历所有行
    for(var i= 0;i<view.getRows().length;i++){
        //判断是否被选中，参数i代表行号
        if(rsm.isSelected(i)){
            status=slaveGridPanel.getStore().getAt(i).get("status");
            slaveId=slaveGridPanel.getStore().getAt(i).get("slaveId");
            flag=true;
            j++;
        }
    }
    if(flag==false){
        result.push(0);
    }else if(flag==true && j>1){
        result.push(j);
        return;
    }else if(flag==true && j==1){
        if(status=="<font color='green'>节点正常</font>"){
            result.push(1);
            result.push(slaveId);
        }else{
            result.push(-1);
        }
    }
    return result;
}

//节点管理列表
function slaveManager(secondGuidePanel){
    var sm2=new Ext.grid.CheckboxSelectionModel();
    //节点列模型
    var slaveModel=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        sm2,
        {header:"slaveId",dataIndex:"slaveId",align:"center"},
        {header:"主机名",dataIndex:"hostName",align:"center"},
        {header:"端口",dataIndex:"port",align:"center"},
        {header:"负载指数",dataIndex:"loadAvg",tooltip:"这是负载指数",align:"center"},
        {header:"状态",dataIndex:"status",align:"center"},
        {header:"运行中作业数",dataIndex:"runningJobNum",align:"center"},
        {header:"运行中转换数",dataIndex:"runningTransNum",align:"center"},
        {header:"已完成作业数",dataIndex:"finishJobNum",align:"center"},
        {header:"已完成转换数",dataIndex:"finishTransNum",align:"center"},
        {header:"运行时长",dataIndex:"upTime",align:"center"}
    ]);

    var proxy=new Ext.data.HttpProxy({url:"/slave/slaveManager.do"});

    var slaveRecord=Ext.data.Record.create([
        {name:"slaveId",type:"string",mapping:"slaveId"},
        {name:"hostName",type:"string",mapping:"hostName"},
        {name:"port",type:"string",mapping:"port"},
        {name:"loadAvg",type:"string",mapping:"loadAvg"},
        {name:"status",type:"string",mapping:"status"},
        {name:"runningJobNum",type:"string",mapping:"runningJobNum"},
        {name:"runningTransNum",type:"string",mapping:"runningTransNum"},
        {name:"finishJobNum",type:"string",mapping:"finishJobNum"},
        {name:"finishTransNum",type:"string",mapping:"finishTransNum"},
        {name:"upTime",type:"string",mapping:"upTime"}
    ])
    //totalProperty代表总条数 root代表当页的数据
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},slaveRecord);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load({params:{start:0,limit:10}});

    var slaveGridPanel=new Ext.grid.GridPanel({
        id:"slaveGridPanel",
        title:"<font size = '3px' >节点管理</font>",
        width:1200,
        height:600,
        cm:slaveModel,
        sm:sm2,
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        tbar:new Ext.Toolbar({
            buttons: [
                {
                    iconCls:"deleteCls",
                    tooltip: '删除节点',
                    id:"deleteSlaveButton",
                    handler:function(){
                        deleteSlave(slaveGridPanel,secondGuidePanel);
                    }
                },"-",
                {
                    iconCls:"testCls",
                    tooltip: '节点体检',
                    handler: function () {
                        slaveTest(slaveGridPanel);
                    }
                },"-",
                {
                    iconCls:"quatoCls",
                    tooltip: '节点指标',
                    handler:function(){
                        quatoWindow(slaveGridPanel);
                    }
                },"-",
                {
                    iconCls:"addCls",
                    tooltip: '新增节点',
                    id:"addSlaveButton",
                    handler:function(){
                        addSlave();
                    }
                },"-",
                {
                    iconCls:"editorCls",
                    tooltip: '修改节点',
                    handler:function(){
                        updateSlave(slaveGridPanel);
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
    })
    if(loginUserName!="admin" && loginUserSlavePower!=1){
        Ext.getCmp("addSlaveButton").hide();
        Ext.getCmp("deleteSlaveButton").hide();
    }
    slaveGridPanel.getColumnModel().setHidden(2,true);
    secondGuidePanel.removeAll(true);
    secondGuidePanel.add(slaveGridPanel);
    secondGuidePanel.doLayout();
}

//弹出展现所有节点指标信息的容器
function quatoWindow(slaveGridPanel){
    var windowHTML="<div id='main1' style='height:250px;width:500px;display:inline-block;'></div>"+
    "<div id='main2' style='height:250px;width:500px;display:inline-block;'></div>"+
    "<div id='main3' style='height:250px;width:500px;display:inline-block;'></div>"+
    "<div id='main4' style='height:250px;width:500px;display:inline-block;'></div>";
    var carteInfoWindow=new Ext.Window({
        title:"节点指标",
        width:1080,
        height:520,
        autoScroll: true,
        id:"executeWindow",
        html:windowHTML,
        bodyStyle:"background-color:white",
        modal:true
    });
    carteInfoWindow.show(slaveGridPanel);
    getQuatoInfo(carteInfoWindow,slaveGridPanel);
}

//获取某个时间段内所有节点的指标信息
function getQuatoInfo(carteInfoWindow,slaveGridPanel){
    var result;
    Ext.Ajax.request({
        url:"/slave/allSlaveQuato.do",
        success:function(response,config){
            var allQuatoResult=Ext.decode(response.responseText);
            showSlaveQuato(allQuatoResult);
            carteInfoWindow.hide();
            carteInfoWindow.show(slaveGridPanel);
        },
        failure:failureResponse
    })
}

//生成节点指标的折线图 包含4个指标项
function showSlaveQuato(result){

    var myChart1 = echarts.init(document.getElementById('main1'));
    var myChart2=echarts.init(document.getElementById('main2'));
    var myChart3 = echarts.init(document.getElementById('main3'));
    var myChart4=echarts.init(document.getElementById('main4'));
    option1 = {
        title: {
            text: '负载情况'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:result.loadAvg.legend
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
        xAxis:result.loadAvg.X,
        yAxis:result.loadAvg.Y,
        series: result.loadAvg.series
    };
    option2 = {
        title: {
            text: '线程数'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:result.threadNum.legend
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
        xAxis:result.threadNum.X,
        yAxis:result.threadNum.Y,
        series:result.threadNum.series
    };
    option3 = {
        title: {
            text: '空闲内存'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:result.freeMem.legend
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
        xAxis:result.freeMem.X,
        yAxis:result.freeMem.Y,
        series:result.freeMem.series
    };
    option4 = {
        title: {
            text: 'CPU利用率'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:result.cpuUsage.legend
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
        xAxis:result.cpuUsage.X,
        yAxis:result.cpuUsage.Y,
        series:result.cpuUsage.series
    };
    myChart1.setOption(option1);
    myChart2.setOption(option2);
    myChart3.setOption(option3);
    myChart4.setOption(option4);
}

//节点体检
function slaveTest(slaveGridPanel){
    var recordList=slaveGridPanel.getSelectionModel().getSelections();
    var hostName="";
    if(recordList.length!=1){
        Ext.MessageBox.alert("请选择一个(只能一个)需要体检的节点!");
    }else{
        hostName=recordList[0].get("hostName");
        //后台返回体检结果之前显示进度条
        Ext.MessageBox.show({
            title:"请等待",
            msg:"正在对节点进行体检",
            progressText:"正在对节点进行体检.....",
            progress:true,
            width:300,
            closable:true
        });
        //更新进度条
        var f=function(i){
            return function(){
                var v=i/10;
                //v代表进度条百分比 取值在0-1之间 第2个参数为显示的文本
                Ext.MessageBox.updateProgress(v,Math.round(100*v)+"%");
            };
        }
        for(var i=1;i<4;i++){
            setTimeout(f(i*3),i*400);
        };
        Ext.Ajax.request({
            url:"/slave/slaveTest.do",
            success:function(response,config){
                Ext.MessageBox.updateProgress(1,"100%");
                testJSONString=response.responseText;
                setTimeout("showTestResultByWindow(testJSONString,slaveGridPanel)",600);
            },
            failure:function(response){
                failureResponse(response);
            },
            params:{hostName:hostName}
        });
    }
}

//以弹窗形式展现体检结果
function showTestResultByWindow(jsonString,slaveGridPanel){
    Ext.MessageBox.hide();
    var json=Ext.decode(jsonString);
    var okImage="<img src='../../ui/images/ok.png' alt='正常'>";
    var errorImage="<img src='../../ui/images/error.png' alt='异常'>";
    var carteStatusImg=json.carteStatus;
    var slaveNetworkImg=json.slaveNetwork;
    (carteStatusImg=="Y")?carteStatusImg=okImage:carteStatusImg=errorImage;
    (slaveNetworkImg=="Y")?slaveNetworkImg=okImage:slaveNetworkImg=errorImage;
    var tableHTML="<table border='1' cellpadding='0' cellspacing='0' width='565px' bgcolor='white'>"
        +"<tr><td height='30px'>体检项</td><td height='30px' align='center'>结果</td></tr>"
        +"<tr><td height='30px'>节点进程状态</td><td height='30px' align='center'>"+carteStatusImg+"</td></tr>"
        +"<tr><td height='30px'>节点服务器网络状态</td><td height='30px' align='center'>"+slaveNetworkImg+"</td></tr>"
        +"<tr><td height='60px'>节点服务增加的第三方工具</td><td height='60px' align='center'>"+json.slaveJarSupport+"</td></tr>"
        +"</table>";
    var testResultWindow=new Ext.Window({
        title:"节点体检",
        width:580,
        height:190,
        id:"executeWindow",
        modal:true,
        html:tableHTML
    });
    testResultWindow.show(slaveGridPanel);
}

//删除节点
function deleteSlave(slaveGridPanel,secondGuidePanel){
    //获取被选中的行记录
    var recordList=slaveGridPanel.getSelectionModel().getSelections();
    if(recordList.length!=1){
        Ext.MessageBox.alert("请选择一个需要删除的节点");
        return;
    }else{
        var slaveId=recordList[0].get("slaveId");
        Ext.Ajax.request({
            url:"/slave/deleteSlave.do",
            success:function(response,config){
                Ext.MessageBox.alert("result","OK");
                slaveManager(Ext.getCmp("secondGuidePanel"));
            },
            failure:failureResponse,
            params:{slaveId:slaveId}
        });
    }
}

//新增节点
function addSlave(){
    var slaveServerWindow=new SlaveServerWin({flag:"add"});
    slaveServerWindow.show();
}

function updateSlave(grid){
    //获取被选中的行记录
    var recordList=grid.getSelectionModel().getSelections();
    if(recordList.length!=1){
        Ext.MessageBox.alert("请选择一个需要修改的节点");
        return;
    }else{
        var slaveId=grid.getSelectionModel().getSelected().get("slaveId");
        Ext.Ajax.request({
            url:"/slave/getSlaveServerInfo.do",
            success:function(response,config){
                var result=Ext.decode(response.responseText);
                var slaveServerWindow=new SlaveServerWin({flag:"update"});
                slaveServerWindow.show(null, function() {
                    slaveServerWindow.initData(result)
                });
            },
            failure:failureResponse,
            params:{slaveId:slaveId}
        })
    }
}

//新增-修改节点的弹窗
SlaveServerWin = Ext.extend(Ext.Window, {
    title: '节点服务器',
    width: 600,
    height: 350,
    modal: true,
    layout: 'fit',
    iconCls: 'SlaveServer',
    flag:'',
    initComponent: function() {
        var me=this;
        var wSlaveId=new Ext.form.TextField({fieldLabel: '节点id', anchor: '-20',hidden:true});
        var wName = new Ext.form.TextField({fieldLabel: '服务器名称', anchor: '-20'});
        var wHostname = new Ext.form.TextField({fieldLabel: '主机名称或IP地址', anchor: '-20'});
        var wPort = new Ext.form.TextField({fieldLabel: '端口号(如果不写就是80端口)', anchor: '-20'});
        var wWebAppName = new Ext.form.TextField({fieldLabel: 'Web App Name(required for DI Server)', anchor: '-20'});
        var wUsername = new Ext.form.TextField({fieldLabel: '用户名', anchor: '-20'});
        var wPassword = new Ext.form.TextField({fieldLabel: '密码', inputType:'password', anchor: '-20'});
        var wMaster = new Ext.form.Checkbox({fieldLabel: '是否主服务器'});

        var wProxyHost = new Ext.form.TextField({fieldLabel: '代理服务器主机名', anchor: '-20'});
        var wProxyPort = new Ext.form.TextField({fieldLabel: '代理服务器端口', anchor: '-20'});
        var wNonProxyHosts = new Ext.form.TextField({fieldLabel: 'Ignore proxy for hosts: regexp | separated', anchor: '-20'});
        this.items = {
            border: false,
            bodyStyle: 'padding: 5px',
            layout: 'fit',
            items: {
                xtype: 'tabpanel',
                activeTab: 0,
                items: [{
                    title: '服务',
                    xtype: 'KettleForm',
                    labelWidth: 200,
                    items: [wSlaveId,wName, wHostname, wPort, wWebAppName, wUsername, wPassword, wMaster]
                },{
                    title: '代理',
                    xtype: 'KettleForm',
                    labelWidth: 250,
                    items: [wProxyHost, wProxyPort, wNonProxyHosts]
                }]
            }
        };

        this.initData = function(data) {
            wName.setValue(data.name);
            wHostname.setValue(data.hostname);
            wPort.setValue(data.port);
            wWebAppName.setValue(data.webAppName);
            wUsername.setValue(data.username);
            wPassword.setValue(data.password);
            wMaster.setValue(data.master == 'Y');
            wProxyHost.setValue(data.proxy_hostname);
            wProxyPort.setValue(data.proxy_port);
            wNonProxyHosts.setValue(data.non_proxy_hosts);
            wSlaveId.setValue(data.slaveId);
        };

        this.bbar = ['->', {
            text: '确定',
            scope: this,
            handler: function() {
                var data = {
                    name: wName.getValue(),
                    hostName: wHostname.getValue(),
                    port: wPort.getValue(),
                    webappName: wWebAppName.getValue(),
                    username: wUsername.getValue(),
                    password: wPassword.getValue(),
                    master: wMaster.getValue() ? 'Y' : 'N',
                    sslMode: 'N',
                    proxyHostname: wProxyHost.getValue(),
                    proxyPort: wProxyPort.getValue(),
                    nonproxyHosts: wNonProxyHosts.getValue(),
                    slaveId:wSlaveId.getValue()==""?0:wSlaveId.getValue()
                };
                if(me.flag=="add"){
                    if(loginUserType==1){
                        Ext.Ajax.request({
                            url:"/slave/addSlave.do",
                            success:function(response,config){
                                if(response.responseText=="Y"){
                                    Ext.MessageBox.alert("新增成功!");
                                    this.close();
                                    slaveManager(Ext.getCmp("secondGuidePanel"));
                                }else{
                                    Ext.MessageBox.alert("添加失败,已存在相同节点!");
                                    me.close();
                                }
                            },
                            failure:failureResponse,
                            params:{slaveServer:JSON.stringify(data),userType:1}
                        })
                    }else{
                        me.close();
                        var item=allUserGroupPanel();
                        var userGroupChooseWindow=new Ext.Window({
                            title:"请为该节点分配可见用户组",
                            width:400,
                            height:480,
                            modal:true,
                            items:[item],
                            tbar:new Ext.Toolbar({
                                buttons: [
                                    {
                                        text:"确认",
                                        handler:function(){
                                            //获取被选中的行记录
                                            var recordList=item.getSelectionModel().getSelections();
                                            var userGroupNameArray=new Array();
                                            for(var i=0;i<recordList.length;i++){
                                                userGroupNameArray.push(recordList[i].get("userGroupName"));
                                            }
                                            Ext.Ajax.request({
                                                url:"/slave/addSlave.do",
                                                success:function(response,config){
                                                    if(response.responseText=="Y"){
                                                        Ext.MessageBox.alert("新增成功!");
                                                        userGroupChooseWindow.close();
                                                        slaveManager(Ext.getCmp("secondGuidePanel"));
                                                    }else{
                                                        Ext.MessageBox.alert("新增失败,该端口已经配置节点!");
                                                        userGroupChooseWindow.close();
                                                    }
                                                },
                                                failure:failureResponse,
                                                params:{slaveServer:JSON.stringify(data),userGroupArray:userGroupNameArray,userType:0}
                                            })
                                        }
                                    }
                                ]
                            })
                        });
                        userGroupChooseWindow.show();
                    }
                }else{
                    Ext.Ajax.request({
                        url:"/slave/updateSlaveServer.do",
                        success:function(response,config){
                            if(response.responseText=="Y"){
                                Ext.MessageBox.alert("修改成功!");
                                me.close();
                                slaveManager(Ext.getCmp("secondGuidePanel"));
                            }else{
                                Ext.MessageBox.alert("修改失败,已存在相同节点!");
                                me.close();
                            }
                        },
                        failure:failureResponse,
                        params:{slaveServer:JSON.stringify(data),userType:1}
                    })
                }

            }
        }];
        SlaveServerDialog.superclass.initComponent.call(this);
        this.addEvents('ok');
    }
});
