
HadoopClusterGrid = Ext.extend(Ext.grid.GridPanel, {
    width: 480,
    height: 350,
    initComponent: function() {
        var me=this;
        var sm2=new Ext.grid.CheckboxSelectionModel();

        var hadoopModel=new Ext.grid.ColumnModel([
            new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
            sm2,
            {header:"name",dataIndex:"name",align:"center"},
            {header:"hdfsUsername",dataIndex:"hdfsUsername",align:"center"},
            {header:"hdfsHost",dataIndex:"hdfsHost",align:"center"},
            {header:"hdfsPort",dataIndex:"hdfsPort",align:"center"}
        ]);
        var proxy=new Ext.data.HttpProxy({url:"/hadoop/allCluster.do"});
        var slaveRecord=Ext.data.Record.create([
            {name:"name",type:"string",mapping:"name"},
            {name:"hdfsUsername",type:"string",mapping:"hdfsUsername"},
            {name:"hdfsHost",type:"string",mapping:"hdfsHost"},
            {name:"hdfsPort",type:"string",mapping:"hdfsPort"}
        ])
        var reader=new Ext.data.JsonReader({},slaveRecord);

        var store=new Ext.data.Store({
            proxy:proxy,
            reader:reader
        })
        store.load();

        this.colModel=hadoopModel;
        this.store=store;
        this.selModel=sm2;

        this.checkIsChoose = function(){
            var recordList=this.getSelectionModel().getSelections();
            return recordList.length;
        };

        this.tbar = [{
            tooltip: '添加配置',
            iconCls:"addCls",
            scope: this,
            handler: function() {
                var hadoopDialog=new HadoopClusterDialog({flag:"add",hadoopClusterGrid:me});
                hadoopDialog.initData("");
                hadoopDialog.show();
            }
        },'-', {
            tooltip: '删除配置',
            iconCls:"deleteCls",
            scope: this,
            handler: function() {
                if(me.checkIsChoose()!=1){
                    Ext.MessageBox.alert("提醒","请先选择单行需要操作的记录");
                }else{
                    var clusterName=this.getSelectionModel().getSelected().get("name");
                    Ext.Ajax.request({
                        url: GetUrl('hadoop/deleteCluster.do'),
                        method: 'POST',
                        params: {clusterName:clusterName},
                        success: function(response) {
                            Ext.MessageBox.alert("Success","删除成功!");
                            me.store.load();
                        }
                    });
                }
            }
        },'-',{
            tooltip: '修改配置',
            iconCls:"editorCls",
            scope: this,
            handler: function() {
                if(me.checkIsChoose()!=1){
                    Ext.MessageBox.alert("提醒","请先选择单行需要操作的记录");
                }else{
                    var clusterName=this.getSelectionModel().getSelected().get("name");
                    Ext.Ajax.request({
                        url: GetUrl('hadoop/getOneCluster.do'),
                        method: 'POST',
                        params: {clusterName:clusterName},
                        success: function(response) {
                            var result=Ext.decode(response.responseText);
                            var hadoopDialog=new HadoopClusterDialog({flag:"update",hadoopClusterGrid:me});
                            hadoopDialog.initData(result);
                            hadoopDialog.show();
                        }
                    });
                }
            }
        },'-', {
            tooltip: '刷新',
            iconCls:"refreshCls",
            scope: this,
            handler: function() {
                me.store.load();
            }
        }];
        HadoopClusterGrid.superclass.initComponent.call(this);
    }
});

HadoopClusterDialog = Ext.extend(Ext.Window, {
    title:"Hadoop Cluster",
    width: 600,
    height: 430,
    modal:true,
    flag:'',
    hadoopClusterGrid:'',
    initComponent: function() {
        var me=this;
        var wClusterName = new Ext.form.TextField({fieldLabel:"Cluster Name"});
        var wUseClient=new Ext.form.Checkbox({boxLabel:'Use MapR Client',checked:false});
        wUseClient.on('check', function(cb, checked) {
            if(checked){
                form1.disable();
                form2.disable();
            }else{
                form1.enable();
                form2.enable();
            }
        });
        var wHDFShost = new Ext.form.TextField({fieldLabel: 'Hostname',anchor: '-10',width:200});
        var wHDFSport = new Ext.form.TextField({fieldLabel: 'port', anchor: '-10',width:80});
        var wHDFSusername = new Ext.form.TextField({fieldLabel: 'username', anchor: '-10',width:200});
        var wHDFSpassword = new Ext.form.TextField({fieldLabel: 'password',inputType:'password', anchor: '-10',width:150});
        var wJobTrackerHost=new Ext.form.TextField({fieldLabel: 'Hostname', anchor: '-10',width:200});
        var wJobTrackerPort = new Ext.form.TextField({fieldLabel: 'port', anchor: '-10',width:80});
        var wZooKeeperHost=new Ext.form.TextField({fieldLabel: 'Hostname', anchor: '-10',width:200});
        var wZooKeeperPort=new Ext.form.TextField({fieldLabel: 'port', anchor: '-10',width:80});
        var woozieUrl=new Ext.form.TextField({fieldLabel: 'URL', anchor: '-10',width:200});
        var wElementId=new Ext.form.Hidden({name: "elementId", value:""});

        this.initData = function(result) {
            if(result==""){
                wHDFShost.setValue("localhost");
                wHDFSport.setValue("8020");
                wHDFSusername.setValue("user");
                wHDFSpassword.setValue("123456");
                wJobTrackerHost.setValue("localhost");
                wJobTrackerPort.setValue("8032");
                wZooKeeperHost.setValue("localhost");
                wZooKeeperPort.setValue("2181");
                woozieUrl.setValue("http://localhost:8080/oozie");
            }else{
                var cluster=result.cluster;
                var elementId=result.elementId;
                wElementId.setValue(elementId);
                wClusterName.setValue(cluster.name);
                wHDFShost.setValue(cluster.hdfsHost);
                wHDFSport.setValue(cluster.hdfsPort);
                wHDFSusername.setValue(cluster.hdfsUsername);
                wHDFSpassword.setValue(cluster.hdfsPassword);
                wJobTrackerHost.setValue(cluster.jobTrackerHost);
                wJobTrackerPort.setValue(cluster.jobTrackerPort);
                wZooKeeperHost.setValue(cluster.zooKeeperHost);
                wZooKeeperPort.setValue(cluster.zooKeeperPort);
                woozieUrl.setValue(cluster.oozieUrl);
                wUseClient.setValue(cluster.mapr);
            }
        };

        this.saveData = function(){
            return {
                name:wClusterName.getValue(),
                hdfsHost:wHDFShost.getValue(),
                hdfsPort:wHDFSport.getValue(),
                hdfsUsername:wHDFSusername.getValue(),
                hdfsPassword:wHDFSpassword.getValue(),
                jobTrackerHost:wJobTrackerHost.getValue(),
                jobTrackerPort:wJobTrackerPort.getValue(),
                zooKeeperHost:wZooKeeperHost.getValue(),
                zooKeeperPort:wZooKeeperPort.getValue(),
                oozieUrl:woozieUrl.getValue(),
                mapr:wUseClient.getValue()
            };
        };

        var formT = new Ext.form.FormPanel({
            labelWidth: 90,
            height: 55,
            style: 'margin:10px',
            items: [wClusterName,wUseClient]
        });

        var form1 = new Ext.form.FormPanel({
            labelWidth: 70,
            frame: true,
            title: 'HDFS',
            style: 'margin:10px',
            height: 100,
            border:true,
            items: [
                {
                    layout:'column',
                    items:[
                        {
                            layout:'form',
                            items:[wHDFShost]
                        },{
                            layout:'form',
                            items:[wHDFSport]
                        }
                    ]},{
                    layout:'column',
                    items:[
                        {
                            layout:'form',
                            items:[wHDFSusername]
                        },{
                            layout:'form',
                            items:[wHDFSpassword]
                        }
                    ]}
            ]
        });

        var form2 = new Ext.form.FormPanel({
            labelWidth: 70,
            frame: true,
            title: 'JobTracker',
            height: 55,
            style: 'margin:10px',
            border:true,
            items: [{
                layout:'column',
                items:[
                    {
                        layout:'form',
                        items:[wJobTrackerHost]
                    },{
                        layout:'form',
                        items:[wJobTrackerPort]
                    }
                ]
            }]
        });

        var form3 = new Ext.form.FormPanel({
            labelWidth: 70,
            frame: true,
            title: 'ZooKeeper',
            height: 55,
            style: 'margin:10px',
            border:true,
            items: [{
                layout:'column',
                items:[
                    {
                        layout:'form',
                        items:[wZooKeeperHost]
                    },{
                        layout:'form',
                        items:[wZooKeeperPort]
                    }
                ]
            }]
        });

        var form4 = new Ext.form.FormPanel({
            labelWidth: 70,
            frame: true,
            title: 'Oozie',
            height: 55,
            style: 'margin:10px',
            border:true,
            items: [{
                layout:'column',
                items:[
                    {
                        layout:'form',
                        items:[woozieUrl]
                    },{
                        layout:'form',
                        items:[wElementId]
                    }
                ]
            }]
        });

        this.items = [formT,form1,form2,form3,form4];
        this.bbar = ['->', {
            text: '取消',
            scope: this,
            handler: function() {
                me.close();
            }
        },'->', {
            text: '确认',
            scope: this,
            handler: function() {
                if(me.flag=="add"){
                    var jsonData=me.saveData();
                    Ext.Ajax.request({
                        url: GetUrl('hadoop/addHadoopCluster.do'),
                        method: 'POST',
                        params: {cluster:JSON.stringify(jsonData)},
                        success: function(response) {
                            if(response.responseText=="faile")
                                Ext.MessageBox.alert("添加失败","已存在同名集群配置!");
                            else{
                                Ext.MessageBox.alert("Success","添加成功!");
                                me.close();
                                me.hadoopClusterGrid.store.load();
                            }
                        }
                    });
                }else if(me.flag=="update"){
                    var jsonData=me.saveData();
                    Ext.Ajax.request({
                        url: GetUrl('hadoop/updateCluster.do'),
                        method: 'POST',
                        params: {cluster:JSON.stringify(jsonData),elementId:wElementId.getValue()},
                        success: function(response) {
                            if(response.responseText=="faile")
                                Ext.MessageBox.alert("修改失败","已存在同名集群配置!");
                            else{
                                Ext.MessageBox.alert("Success","修改成功!");
                                me.close();
                                me.hadoopClusterGrid.store.load();
                            }
                        }
                    });
                }else{
                    me.close();
                }
            }
        }];

        HadoopClusterDialog.superclass.initComponent.call(this);
    }
});