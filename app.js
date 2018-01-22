Vue.config.productionTip=true
//孙子元素
var Editor = {
	  props:['entityObject'],
	  data:function(){
	    return {
	      entity:this.entityObject
	    }
	  },
    //update函数进行更新
	  methods:{
	    update:function(){
	      //子元素向父元素传递数据
	      this.$emit('updateEvent')
	    }
	  },
  //表单模板
	  template:`
	    <div class="ui form">
	      <div class="field">
	        <textarea
	          row="5"
	          placeholder="请写点什么"
	          class="textarea"
	          v-model="entity.body"
	          v-on:input="update"
	          >
	          </textarea>
	      </div>
	    </div>
	  `
	}
//子元素
var Note = {
	  //props父元素向子元素传递信息
	  props:['entityObject'],
	  data:function(){
	    return {
	      entity:this.entityObject,
	      show:true
	    }
	  },
	  //更新时间,获取字数,字符串的截取
	  computed:{
	    meta:function(){
	      //获取当前时间与之前时间进行计算
	      return moment(this.entity.meta.updated).fromNow()
	    },
	    word:function(){
	      return this.entity.body.trim().length
	    },
	    header:function(){
	      return _.truncate(this.entity.body,{length:30})
	    }
	  },
	  methods:{
	    save:function(){
	      loadCollection("notes")
	        .then(collection => {
	          collection.update(this.entity)
	          db.saveDatabase()
	        })
	    },
	    del:function(){
	      this.$emit("destroyEvent",this.entity.$loki)
	    }
	  },
	  //编辑标题模板
	  template:`
	    <div class="item">
	      <div class="meta">
	        {{ meta }}
	      </div>
	      <div class="content">
	        <div class="header" @click="show=!show">
	          		{{ header || '新增笔记'}}
	        </div>
	        <div class="extra">
	          <editor
	             @updateEvent="save"
	             v-bind:entityObject="entity" v-show='show'></editor>
	        </div>
	        {{ word }}字
	        <i class="icon trash right floated"
	          @click="del"></i>
	      </div>
	    </div>
	  `,
	  // editor是Note的子组件
	  components:{
	    "editor":Editor
	  }
	}
// 父元素
var Notes = {
	  data:function(){
	    return {
	      //定义全局变量，数据存储在这个数组
	      entities:[]
	    }
	  },
	  //查询数据
	  created:function(){
	    loadCollection("notes")
	    //回调函数，箭头函数
	      .then(collection => {
	        //定义一个变量，进行id（$loki）查询
	        var _entities = collection.chain()
	                          .find()
	                          .simplesort('$loki','isdesc')
	                          .data()
	        console.log(_entities)
	        this.entities = _entities
	      })
	  },
	    //头部标题模板
	  template:`
	    <div class="ui container notes">
	      <div class="ui horizontal divider header">
	        <i class="icon paw"></i>
	        Notes App -- Vue.js
	      </div>
	      <button class="ui right floated button violet basic"
	        @click="insertEntity">
	        添加笔记
	      </button>
	      <div class='div ' v-show='entities.length==0'>
	      ----请单击按钮进行文章添加----
	      </div>
	      <div class="ui items divided">
	        <note v-for="entity in entities"
	          v-bind:entityObject="entity"
	          v-bind:key="entity.$loki"
	          @destroyEvent="destroyEntity">
	        </note>
	      </div>
	    </div>
	  `,
	  //点击添加文章，进行插入操作
	  methods:{
	    insertEntity:function(){
	      loadCollection("notes")
	      //插入数据
	        .then( collection => {
	          var _entity = collection.insert({"body":""})
	          //存储到location本地记录
	          db.saveDatabase()
	            //当前数据放在entity
	          this.entities.unshift(_entity)
	        })
	    },
	    destroyEntity:function(id){
	    	var xuanze=confirm('确定要删除');
	    	if(xuanze){
	    		var _entities = this.entities.filter( entity => {
	        	return entity.$loki !== id
		      })
		      this.entities = _entities
		      loadCollection("notes")
	        .then( collection => {
	          collection.remove({"$loki":id})
	          db.saveDatabase()
	        })
	    	}
	      
	    }
	  },	
	  components:{
	    "note":Note
	  }
}

var vm = new Vue({
  el:'#app',
  components:{
    "notes":Notes
  },
  template:`
    <notes></notes>
  `
})
