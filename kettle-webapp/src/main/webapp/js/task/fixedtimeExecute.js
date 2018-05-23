//日期(1号-30号)的下拉选择框
function generateDayChooseByMonth(){
    //下拉列表智能执行的数据来源  暂时支持4种定时
    var monthData=[
        [1,"1号"],
        [2,"2号"],
        [3,"3号"],
        [4,"4号"],
        [5,"5号"],
        [6,"6号"],
        [7,"7号"],
        [8,"8号"],
        [9,"9号"],
        [10,"10号"],
        [11,"11号"],
        [12,"12号"],
        [13,"13号"],
        [14,"14号"],
        [15,"15号"],
        [16,"16号"],
        [17,"17号"],
        [18,"18号"],
        [19,"19号"],
        [20,"20号"],
        [21,"21号"],
        [22,"22号"],
        [23,"23号"],
        [24,"24号"],
        [25,"25号"],
        [26,"26号"],
        [27,"27号"],
        [28,"28号"],
        [29,"29号"],
        [30,"30号"]
    ]
    var monthProxy=new Ext.data.MemoryProxy(monthData);

    //下拉列表的数据结构
    var monthRecord=Ext.data.Record.create([
        {name:"dayId",type:"string",mapping:0},    //此列为下拉列表的实际获得值
        {name:"dayName",type:"string",mapping:1}   //此列为下拉列表的显示值
    ])
    var monthReader=new Ext.data.ArrayReader({},monthRecord);

    var store=new Ext.data.Store({
        proxy:monthProxy,
        reader:monthReader,
        autoLoad:true
    });
    var monthChoose=new Ext.form.ComboBox({
        name:"monthChoose",
        id:"monthChoose",
        triggerAction:"all",
        store:store,
        displayField:"dayName",
        valueField:"dayId",
        mode:"local",
        emptyText:"请选择日期"
    })
    return monthChoose;
}

//周一到周日的下拉选择框
function generateDayChooseByWeek(){
    //下拉列表智能执行的数据来源  暂时支持4种定时
    var weekData=[
        [1,"周一"],
        [2,"周二"],
        [3,"周三"],
        [4,"周四"],
        [5,"周五"],
        [6,"周六"],
        [7,"周日"]
    ]
    var weekProxy=new Ext.data.MemoryProxy(weekData);

    //下拉列表的数据结构
    var weekRecord=Ext.data.Record.create([
        {name:"weekId",type:"string",mapping:0},    //此列为下拉列表的实际获得值
        {name:"weekName",type:"string",mapping:1}   //此列为下拉列表的显示值
    ])
    var weekRecord=new Ext.data.ArrayReader({},weekRecord);

    var store=new Ext.data.Store({
        proxy:weekProxy,
        reader:weekRecord,
        autoLoad:true
    });
    var weekChoose=new Ext.form.ComboBox({
        id:"weekChoose",
        name:"weekChoose",
        triggerAction:"all",
        store:store,
        displayField:"weekName",
        valueField:"weekId",
        mode:"local",
        emptyText:"请选择时间"
    })
    return weekChoose;
}

//分钟输入框
function MinuteTextField(){
    minute=new Ext.form.TextField({
        id:"minuteField",
        name: "minute",
        fieldLabel:"分",
        width:50,
        value:0,
        regex:/^[1-5]?[0-9]$/,
        invalidText:"时间的分钟部分,有效值为0-59",
        validateOnBlur:true
    });
    return minute;
}

//小时输入框
function HourTextField(){
     hour=new Ext.form.TextField({
         id:"hourField",
        name: "hour",
        fieldLabel: "时",
        width:50,
        value:0,
        regex:/^(([0-9]{0,1})|(1[0-9])|(2[0-3]))$/,
        invalidText:"时间的小时部分,24小时制,有效值为0-23",
        validateOnBlur:true
    });
    return hour;
}

//时间间隔输入框
function IntevalMinuteTextField(){
    intervalTime=new Ext.form.TextField({
        id:"intervalminute",
        name: "intervalminute",
        fieldLabel: "时间间隔(单位/分钟)",
        width:50,
        value:0,
        regex:/^(^[1-9]$)|(^[1-5][0-9]$)$/,
        invalidText:"循环执行的时间间隔,有效值1-59",
        validateOnBlur:true
    });
    return intervalTime;
}

//生成定时执行的窗口
function fixedExecuteWindow(flag,formElementArray,uri){
     var chooseForm=generateDateForm(flag,formElementArray,uri);
    //获得节点展示列表
    fiexdWindow=new Ext.Window({
        id:"fiexdWindow",
        width:610,
        height:280,
        id:"fiexdWindow",
        modal:true,
        items:[chooseForm]
    });
    return fiexdWindow;
}

//生成定时执行时收集定时参数的表单
function generateDateForm(flag,array,uri){
    //定时类型下拉选择框加入数组
    var chooseCombox=getExecuteTypeCombox(flag,uri);
    array.push(chooseCombox);
    //遍历定时执行所需要的按钮 加入数组 flag为传递过来的功能类型 添加定时or修改定时
    var buttonArray=generateToolButton(flag);
    for(var i=0;i<buttonArray.length;i++){
        array.push(buttonArray[i]);
    }
    fiexdForm=new Ext.form.FormPanel({
        url:uri,
        title:"定时选择",
        id:"fiexdForm",
        width:600,
        height:250,
        frame:true,
        labelWidth:130,
        labelAlign:"right",
        items:array
    });
    return fiexdForm;
}

//获得定时执行时候需要的下拉框(可选择定时执行的类型)
function getExecuteTypeCombox(flag,uri){
    //下拉列表智能执行的数据来源  暂时支持4种定时
    var typeData=[
        ["间隔重复","间隔重复"],
        ["每天执行","每天执行"],
        ["每周执行","每周执行"],
        ["每月执行","每月执行"]
    ]
    var typeProxy=new Ext.data.MemoryProxy(typeData);

    //下拉列表的数据结构
    var typeRecord=Ext.data.Record.create([
        {name:"typeId",type:"string",mapping:0},    //此列为下拉列表的实际获得值
        {name:"typeName",type:"string",mapping:1}   //此列为下拉列表的显示值
    ])
    var typeReader=new Ext.data.ArrayReader({},typeRecord);

    var store=new Ext.data.Store({
        proxy:typeProxy,
        reader:typeReader,
        autoLoad:true
    })

    var typeChoose=new Ext.form.ComboBox({
        id:"typeChoose",
        name:"typeChoose",
        triggerAction:"all",
        store:store,
        autoLoad:true,
        displayField:"typeName",
        valueField:"typeId",
        mode:"local",
        emptyText:"请选择定时执行的方式",
        listeners:{
            //index是被选中的下拉项在整个列表中的下标 从0开始
            'select':function(combo,record,index){
                var formArray=new Array();
                var parWindow=Ext.getCmp("fiexdWindow");
                //移除当前表单
                parWindow.remove("fiexdForm");
                var chooseTypeName="";
                switch(index)
                {
                    case 0:
                        //按指定的时间间隔执行
                        formArray.push(IntevalMinuteTextField());
                        chooseTypeName="间隔重复";
                        break;
                    case 1:
                        //每天的某个时间执行
                        formArray.push(HourTextField());
                        formArray.push(MinuteTextField());
                        chooseTypeName="每天执行";
                        break;
                    case 2:
                    //每周的某个星期X执行(例如每周三13:00执行)
                        formArray.push(HourTextField());
                        formArray.push(MinuteTextField());
                        formArray.push(generateDayChooseByWeek());
                       chooseTypeName="每周执行";
                        break;
                    case 3:
                        formArray.push(HourTextField());
                        formArray.push(MinuteTextField());
                        formArray.push(generateDayChooseByMonth());
                        chooseTypeName="每月执行";
                        break;
                    default:
                        return;
                }
                //重新生成表单并且添加到window中
                var dateForm=generateDateForm(flag,formArray,uri);
                parWindow.items.add(dateForm);
                parWindow.hide();
                parWindow.show(Ext.getCmp("JobPanel"));
                //给定时类型下拉框赋予用户选择的值
                var typeChoose=Ext.getCmp("typeChoose");
                typeChoose.setValue(chooseTypeName);
            }
        }
    });
    return typeChoose;
}

//button
function generateToolButton(flag){
    var buttonArray=new Array();
    if(flag=="修改"){
        //修改定时界面的提交按钮
        updateButton=new Ext.Button({
            text:"修改定时",
            width:80,
            style: {
                marginLeft:'230px',//距左边宽度
                marginTop:'10px'
            },
            handler:function(){
                var chooseType=Ext.getCmp("typeChoose").getValue();
                if(chooseType==undefined || chooseType==""){
                    Ext.MessageBox.alert("提交失败","请先选择定时类型");
                    return;
                }else{
                    var targetForm=Ext.getCmp("fiexdForm");

                    //把获取到的定时Id以隐藏域形式显示 并且加入到表单中
                    var jobSchedulerGrid=Ext.getCmp("schedulergrid");
                    var view=jobSchedulerGrid.getView();
                    var rsm=jobSchedulerGrid.getSelectionModel();
                    var taskId="";
                    for(var i=0;i<view.getRows().length;i++){
                        if(rsm.isSelected(i)){
                            taskId=jobSchedulerGrid.getStore().getAt(i).get("idJobtask");
                        }
                    }
                    var taskIdHidden=new Ext.form.Hidden({
                        name: "taskId",
                        value:taskId
                    });
                    targetForm.items.add(taskIdHidden);
                    targetForm.doLayout();
                    //验证表单填写是否规范 然后提交表单
                    targetForm.baseParams=targetForm.getForm().getValues();
                    if(targetForm.getForm().isValid()){
                        targetForm.getForm().submit({
                            success:function(form,action){
                                if(action.result.isSuccess==false){
                                    Ext.MessageBox.alert("修改失败","该作业已经存在相同执行周期的调度计划");
                                }else{
                                    Ext.MessageBox.alert("成功","修改定时成功!");
                                    var thisWindow=Ext.getCmp("fiexdWindow");
                                    thisWindow.close();
                                    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
                                    generateSchedulerMonitorPanel(secondGuidePanel);
                                }
                            },
                            failure:failureResponse
                        })
                    }else{
                        Ext.MessageBox.alert("失败","表单存在不规范填写,请再次确认后提交!");
                    }
                }
            }
        });
        buttonArray.push(updateButton);
    }else if(flag=="添加"){
        //添加定时界面的提交按钮
        addButton=new Ext.Button({
            text:"下一步",
            width:80,
            style: {
                marginLeft:'230px',//距左边宽度
                marginTop:'10px'
            },
            handler:function(){
                //判断是否选择了定时类型
                var chooseType=Ext.getCmp("typeChoose").getValue();
                if(chooseType==undefined || chooseType==""){
                    Ext.MessageBox.alert("提交失败","请先选择定时类型");
                    return;
                }else{
                    var weekChoose=Ext.getCmp("weekChoose");
                    var monthChoose=Ext.getCmp("monthChoose");
                    if(chooseType=="每周执行"){
                        if(weekChoose.getValue()==undefined || weekChoose.getValue()==""){
                            Ext.MessageBox.alert("提示","请先选择每周执行的时间")
                            return;
                        }
                    }
                    if(chooseType=="每月执行"){
                        if(monthChoose.getValue()==undefined || monthChoose.getValue()==""){
                            Ext.MessageBox.alert("提示","请先选择每月执行的日期")
                            return;
                        }
                    }

                    var targetForm=Ext.getCmp("fiexdForm");
                    //获取被选中作业的作业名 作业id 作业全目录名
                    var jobInfo=getJobInfo();
                    var jobIdHidden=new Ext.form.Hidden({
                        name: "jobId",
                        value:jobInfo[0]
                    });
                    var jobNameHidden=new Ext.form.Hidden({
                        name: "jobName",
                        value:jobInfo[1]
                    });
                    var jobPathHidden=new Ext.form.Hidden({
                        name: "jobPath",
                        value:jobInfo[2]
                    });
                    //作业Id、作业name、作业全目录名以隐藏域的形式加入到表单中
                    targetForm.items.add(jobIdHidden);
                    targetForm.items.add(jobNameHidden);
                    targetForm.items.add(jobPathHidden);
                    targetForm.doLayout();
                    //表单中所有表单控件作为请求参数
                    targetForm.baseParams=targetForm.getForm().getValues();
                    if(targetForm.getForm().isValid()){
                        var path=jobInfo[2];
                        targetForm.getForm().submit({
                            success:function(form,action){
                                if(action.result.isSuccess==false){
                                    Ext.MessageBox.alert("失败","该作业已经存在相同执行周期的调度计划");
                                }else{
                                   /* var defaultConfig="{'exec_local':'Y','exec_remote':'N','pass_export':'N','parameters':[],"
                                       +"'variables':[],'arguments':[], 'safe_mode':'N','log_level':'Basic','clear_log':'Y',"
                                       +" 'start_copy_nr':0,'gather_metrics':'N','expand_remote_job':'N','remote_server':'',"
                                       +"'replay_date':'','start_copy_name':''}";
                                    var dialog = new JobExecutionConfigurationScheduler();
                                    dialog.show(null, function() {
                                        dialog.initData(defaultConfig);
                                    });*/
                                    Ext.Ajax.request({
                                        url: GetUrl('task/detail.do'),
                                        method: 'POST',
                                        params: {taskName: path,type:'job'},
                                        success: function(response) {
                                            var thisWindow=Ext.getCmp("fiexdWindow");
                                            thisWindow.close();
                                            //弹出执行窗口
                                            var resObj = Ext.decode(response.responseText);
                                            var graphPanel = Ext.create({border: false, Executable: true },"JobGraphScheduler");
                                            var dialog = new LogDetailDialog({
                                                items: graphPanel,
                                                id:"schedulerDialog"
                                            });
                                            activeGraph = graphPanel;
                                            dialog.show(null, function() {
                                                var xmlDocument = mxUtils.parseXml(decodeURIComponent(resObj.graphXml));
                                                var decoder = new mxCodec(xmlDocument);
                                                var node = xmlDocument.documentElement;
                                                var graph = graphPanel.getGraph();
                                                decoder.decode(node,graph.getModel());
                                                graphPanel.setTitle(graph.getDefaultParent().getAttribute('name'));
                                            });
                                        }
                                    });
                                }
                            },
                            failure:failureResponse
                        })
                    }else{
                        Ext.MessageBox.alert("失败","表单存在不规范填写,请再次确认!");
                    }
                }
            }
        });
        buttonArray.push(addButton);
    }
    return buttonArray;
}

