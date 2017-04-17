'/assets/bg.png'

var imageUrl = '/home/image.png'
var bgMusicUrl = "/no-folder/music.mp3"

export default React.createClass({
  render: function () {
    // Use asset URLs as they will be served by the server so that the URLs
    // don't need to be translated.
    var imageUrl = this.props.imageUrl || '/assets/Badge/default-badge.svg'
    return (
      <div className="Badge"><img src={imageUrl} /></div>
    )
  }
})

'/* string */'

'/* string'

'// string '

/* 'some/url/file.video' */

// 'some/file.stuff'

// 'some/file/@/end.ext'
