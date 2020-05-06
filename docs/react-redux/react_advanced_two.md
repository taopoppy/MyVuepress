# React的生命周期

## React中的ref
我们可以使用`ref`来操作`DOM`,比如这样：
```javascript
// TodoList.js
class TodoList extends Component {
  handleInputChange(e) {
    const value = this.input.value  // 现在的写法
    // const value = e.target.value // 以前的写法
  }
  render() {
    return (
      <input
        onChange={this.handleInputChange}
        ref={(input) => {this.input = input}} // 通过this.input可以直接访问到input这个DOM元素
      />
    )
  }
}
```
但是我们不太推荐直接使用`ref`去操作元素：
+ <font color=#DD1144>react希望我们尽量通过修改数据的方式来修改视图，而不是直接使用ref的方式去修改DOM</font>
+ <font color=#DD1144>通过修改数据的方式通常都是异步的，直接修改DOM的ref方法是同步的，两者一起使用经常会出现时差的bug，对新手不太友好</font>

## React的生命周期

## 生命周期的使用场景