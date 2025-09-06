const mysql = require('mysql2/promise');
const NotificationHelper = require('../utils/notificationHelper');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  charset: config.database.charset
};

// 模拟数据生成器
class DataGenerator {
  constructor() {
    // 读取图片链接文件
    this.avatarLinks = this.loadLinksFromFile('../imgLinks/avatar_link.txt');
    this.imageLinks = this.loadLinksFromFile('../imgLinks/post_img_link.txt');
    // 与前端严格对应的分类
    this.categories = [
      'opensource', 'knowledge', 'tinkering', 'wallpaper',
      'weblinks', 'repost', 'aitools', 'selfbuilt', 'upfollow', 'todo'
    ];
    // 分类对应的中文名称和相关内容
    this.categoryData = {
      'opensource': {
        name: '开源项目',
        tags: ['开源', 'GitHub', '项目', '代码', '开发', '技术', '分享', '学习'],
        titles: [
          '发现一个超棒的开源项目，必须分享给大家',
          '我参与的开源项目经历分享',
          '这些开源工具改变了我的开发效率',
          '开源项目贡献指南，新手也能参与',
          '推荐几个值得关注的GitHub项目',
          '从使用者到贡献者，我的开源之路',
          '开源项目如何选择和评估',
          '分享我收藏的开源项目清单',
          '开源协作的正确姿势',
          '这个开源项目解决了我的痛点问题'
        ],
        contents: [
          '最近发现了一个非常有意思的开源项目，功能强大且代码质量很高。项目文档详细，社区活跃，非常适合学习和使用。',
          '分享一些我在开源项目中的经验和收获，包括如何找到合适的项目、如何参与贡献、以及在协作过程中需要注意的事项。',
          '整理了一份我平时使用的开源工具清单，涵盖开发、设计、运维等各个方面，每个都是经过实践验证的好工具。',
          '开源不仅是代码的分享，更是知识和经验的传递。今天想和大家聊聊参与开源项目给我带来的成长和思考。'
        ]
      },
      'knowledge': {
        name: '知识碎片',
        tags: ['知识', '学习', '技巧', '经验', '总结', '笔记', '思考', '分享'],
        titles: [
          '今天学到的小知识，记录一下',
          '工作中遇到的问题和解决方案',
          '读书笔记：这本书给我的启发',
          '生活小技巧，让日常更高效',
          '学习方法分享，提升效率必备',
          '知识点总结，方便日后查阅',
          '思维导图制作心得',
          '碎片化学习的正确方式',
          '知识管理系统搭建经验',
          '从零开始学习新技能的方法'
        ],
        contents: [
          '在学习和工作中经常会遇到一些有趣的知识点，虽然看似零散，但积累起来却能形成完整的知识体系。今天分享一些我最近整理的知识碎片。',
          '记录一些平时学习和思考的心得，包括学习方法、思维方式、问题解决等方面的经验总结。希望这些碎片化的知识能够帮助到有需要的朋友。',
          '知识的价值不在于多少，而在于能否被有效利用。分享一些我在知识管理和应用方面的实践经验。',
          '每天都在学习新的东西，虽然都是些小知识点，但汇聚起来就是很大的收获。记录下来，方便以后回顾和应用。'
        ]
      },
      'tinkering': {
        name: '折腾日常',
        tags: ['折腾', '技术', '工具', '配置', '优化', '探索', '实验', 'DIY'],
        titles: [
          '又开始折腾新工具了，记录一下过程',
          '系统配置优化，让电脑运行更流畅',
          '自建服务搭建经验分享',
          '软件推荐：这些工具提升了我的效率',
          '硬件升级记录，性能提升明显',
          '网络配置折腾日记',
          '开发环境搭建全记录',
          '数据备份方案的选择与实践',
          '自动化脚本编写心得',
          '树莓派项目实践记录'
        ],
        contents: [
          '作为一个爱折腾的人，总是忍不住要尝试各种新工具和新方法。今天分享一下最近折腾的一些有趣项目和心得体会。',
          '折腾的过程虽然有时候很痛苦，但最终解决问题时的成就感是无与伦比的。记录一下这次折腾的完整过程，希望能帮助到遇到类似问题的朋友。',
          '分享一些我在技术探索和工具使用方面的经验，包括踩过的坑和总结的经验。折腾有风险，操作需谨慎！',
          '最近又开始了新一轮的折腾，这次的目标是优化整个工作流程。虽然过程曲折，但结果还是很令人满意的。'
        ]
      },
      'wallpaper': {
        name: '壁纸收集',
        tags: ['壁纸', '美图', '设计', '艺术', '摄影', '插画', '风景', '收藏'],
        titles: [
          '精美壁纸分享，每一张都是精品',
          '4K高清壁纸收集，视觉盛宴',
          '极简风格壁纸，简约而不简单',
          '自然风光壁纸，感受大自然的美',
          '动漫壁纸精选，二次元的美好',
          '抽象艺术壁纸，艺术与科技的结合',
          '黑白摄影壁纸，经典永不过时',
          '节日主题壁纸，应景又好看',
          '手机壁纸推荐，让屏幕更精彩',
          '桌面壁纸整理，打造个性化工作环境'
        ],
        contents: [
          '收集了一些最近发现的精美壁纸，包括风景、艺术、设计等各种风格。每一张都经过精心挑选，希望大家喜欢。',
          '好的壁纸不仅能美化桌面，还能在工作疲惫时给人带来视觉上的享受。分享一些我珍藏的高质量壁纸资源。',
          '壁纸的选择往往反映了一个人的审美和心情。今天整理了一些不同风格的壁纸，总有一款适合你。',
          '定期更换壁纸是我的一个小习惯，不同的壁纸能带来不同的心情和灵感。分享一些我最喜欢的壁纸收藏。'
        ]
      },
      'weblinks': {
        name: '网页收集',
        tags: ['网站', '工具', '资源', '收藏', '推荐', '实用', '设计', '学习'],
        titles: [
          '实用网站推荐，工作学习必备',
          '设计资源网站合集，设计师的宝库',
          '在线工具推荐，提升效率神器',
          '学习网站分享，免费优质资源',
          '开发者必备网站清单',
          '创意灵感网站，激发无限想象',
          '免费图库网站推荐，高质量素材',
          '技术文档和教程网站整理',
          '生活实用网站，让生活更便利',
          '小众但好用的网站发现'
        ],
        contents: [
          '互联网上有很多优秀的网站和在线工具，但往往需要时间去发现和整理。今天分享一些我收藏的实用网站，希望能帮助到大家。',
          '收集了一些在工作和学习中经常用到的网站，涵盖设计、开发、学习、工具等各个方面。每一个都是经过实践验证的好资源。',
          '好的网站就像好的工具，能够大大提升我们的工作效率。分享一些我精心收集的网站资源，都是干货满满。',
          '定期整理和分享收藏的网站是一个好习惯，不仅方便自己查找，也能帮助到其他有需要的人。'
        ]
      },
      'repost': {
        name: '转载',
        tags: ['转载', '分享', '推荐', '好文', '资讯', '观点', '学习', '收藏'],
        titles: [
          '好文推荐：这篇文章值得一读',
          '转载分享：深度好文不容错过',
          '精选文章：作者的观点很有启发',
          '推荐阅读：这个话题讨论很精彩',
          '值得收藏的优质内容分享',
          '转载：技术文章，干货满满',
          '好文转发：观点独到，值得思考',
          '精彩内容分享，不容错过',
          '转载推荐：这个作者写得真好',
          '优质内容转载，值得学习'
        ],
        contents: [
          '看到一篇非常不错的文章，观点独到，论述清晰，忍不住要分享给大家。希望大家也能从中获得启发和收获。',
          '转载一些我认为有价值的内容，包括技术文章、思考感悟、行业观察等。每一篇都是经过筛选的优质内容。',
          '互联网上有很多优秀的内容创作者，他们的文章和观点值得被更多人看到。今天转载分享几篇好文。',
          '阅读和分享是学习的重要方式，通过转载优质内容，希望能够促进更多的交流和讨论。'
        ]
      },
      'aitools': {
        name: 'AI工具',
        tags: ['AI', '人工智能', '工具', '效率', '自动化', '机器学习', '技术', '创新'],
        titles: [
          'AI工具推荐：这些工具改变了我的工作方式',
          'ChatGPT使用技巧分享',
          'AI绘画工具体验，创意无限',
          '自动化工作流：AI工具的实际应用',
          'AI写作助手，提升内容创作效率',
          '机器学习工具推荐，入门必备',
          'AI代码助手使用心得',
          '语音AI工具测评，解放双手',
          'AI设计工具，让创意更容易实现',
          '未来已来：AI工具的发展趋势'
        ],
        contents: [
          'AI技术的发展为我们带来了很多实用的工具，这些工具不仅提升了工作效率，还开拓了新的可能性。分享一些我使用过的优秀AI工具。',
          '人工智能正在改变我们的工作和生活方式，越来越多的AI工具涌现出来。今天推荐一些我认为特别有用的AI应用。',
          '从文本生成到图像创作，从代码编写到数据分析，AI工具的应用场景越来越广泛。分享一些实用的AI工具使用经验。',
          'AI不是要替代人类，而是要帮助人类更好地工作和创造。通过合理使用AI工具，我们可以把更多时间投入到真正有价值的事情上。'
        ]
      },
      'selfbuilt': {
        name: '自建项目',
        tags: ['自建', '项目', '开发', '搭建', '服务', '部署', '运维', '实践'],
        titles: [
          '自建博客系统，从零开始的完整记录',
          '家庭NAS搭建经验分享',
          '个人网站建设全过程',
          '自建云盘服务，数据安全掌控',
          'Docker容器化部署实践',
          '自动化部署流程搭建',
          '监控系统自建方案',
          '个人项目上线全记录',
          '服务器配置和优化经验',
          '从想法到实现：项目开发日记'
        ],
        contents: [
          '最近完成了一个自建项目，从需求分析到技术选型，从开发实现到部署上线，整个过程都很有收获。今天分享一下完整的经验。',
          '自建项目不仅能够满足个性化需求，还能在实践中学到很多知识。记录一下这次项目的技术难点和解决方案。',
          '分享一些自建项目的心得体会，包括技术选择、架构设计、部署运维等各个环节的经验总结。',
          '从想法到实现，每一个自建项目都是一次完整的学习过程。今天想和大家分享这个项目背后的故事和技术细节。'
        ]
      },
      'upfollow': {
        name: 'up关注',
        tags: ['UP主', '关注', '推荐', '内容', '创作者', '视频', '学习', '分享'],
        titles: [
          '推荐几个值得关注的技术UP主',
          '这些UP主的内容质量真的很高',
          '学习向UP主推荐，干货满满',
          '设计类UP主分享，创意无限',
          '生活方式UP主，治愈系内容',
          '编程教学UP主，新手友好',
          '科技数码UP主，前沿资讯',
          '读书分享UP主，知识传递',
          '手工DIY UP主，创意实用',
          '摄影教程UP主，技巧分享'
        ],
        contents: [
          '最近发现了几个非常不错的UP主，他们的内容质量很高，更新也很稳定。今天推荐给大家，希望大家也会喜欢。',
          '优质的内容创作者值得被更多人关注和支持。分享一些我长期关注的UP主，他们的内容都很有价值。',
          '在信息爆炸的时代，找到优质的内容源非常重要。推荐一些我认为值得关注的UP主和创作者。',
          '好的UP主不仅能提供有用的信息，还能带来新的思考和启发。今天整理了一份我的关注清单分享给大家。'
        ]
      },
      'todo': {
        name: '待办项目',
        tags: ['待办', '计划', '项目', '目标', '规划', '进度', '管理', '提醒'],
        titles: [
          '2024年度项目计划，这些事情要完成',
          '待办清单整理，优先级排序',
          '项目进度更新，完成情况汇报',
          '学习计划制定，系统性提升',
          '个人目标设定，新的挑战',
          '项目管理心得，提升执行力',
          '时间管理技巧，高效完成任务',
          '待办事项回顾，经验总结',
          '目标达成方法，持续改进',
          '项目规划模板，提升效率'
        ],
        contents: [
          '新的一年开始了，是时候整理一下待办的项目和计划了。设定清晰的目标和时间节点，让每一个想法都能落地实现。',
          '项目管理是一门学问，如何合理安排时间和资源，如何跟踪进度和质量，都需要不断的学习和实践。',
          '分享一些我在项目管理和时间管理方面的经验，包括工具使用、方法论应用、以及一些实用的技巧。',
          '待办不是压力，而是前进的方向。通过合理的规划和执行，每一个待办项目都能成为成长路上的里程碑。'
        ]
      }
    };

    this.usernames = ['云鲸漫游', '芋圆小甜饼', '晚风扑满怀', '雾岛听风', '星子打烊了', '春日部干事', '奶油小方', '山月记', '半糖去冰', '枕星河入梦', '树影摇窗', '汽水冒泡', '碎碎 念小记', '盐系小野猫', '贩卖日落', '莓烦恼', '焦糖玛奇朵', '雨停了就走', '北岛迷途', '小桃汽泡', '青柠七分甜', '雾散 见山', '夏夜晚风', '一口吃掉月亮', '林间小筑', '念安', '奶芙泡芙', '星河欲转', '南风知我意', '小梨涡', '橘色晚霞', '薄荷微光', '山茶花读不懂白玫瑰', '月落星沉', '小熊软糖', '岛与幕歌', '风拂过裙摆', '拾光者', '芋泥啵啵', '雾漫南山', '半窗疏影', '软风沉醉', '甜度超标', '落日收藏家', '碎星入怀', '清粥配小菜', '云深不知处', '晚风寄信', '青衫仗剑', '小春日和'];
    this.locations = ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '南京', '武汉', '天津', '苏州', '长沙', '郑州', '青岛', '大连', '厦门', '福州', '昆明', '贵阳', '南宁', '海口', '三亚', '拉萨', '乌鲁木齐', '银川', '西宁', '兰州', '呼和浩特', '哈尔滨', '长春', '沈阳', '石家庄', '太原', '济南', '合肥', '南昌', '温州', '宁波', '无锡', '常州', '徐州', '扬州', '镇江', '泰州', '盐城', '淮安', '连云港', '宿迁', '嘉兴'];
  }

  //生成随机图片URL（用于笔记图片）
  // 从文件加载链接
  loadLinksFromFile(filename) {
    try {
      const filePath = path.join(__dirname, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      return content.trim().split('\n').filter(link => link.trim());
    } catch (error) {
      console.error(`读取文件 ${filename} 失败:`, error);
      return [];
    }
  }

  generateRandomImageUrl() {
    const randomIndex = Math.floor(Math.random() * this.imageLinks.length);
    return this.imageLinks[randomIndex];
  }

  //生成随机头像URL
  generateRandomAvatarUrl() {
    const randomIndex = Math.floor(Math.random() * this.avatarLinks.length);
    return this.avatarLinks[randomIndex];
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 清空数据库表数据
  async clearTables(connection) {
    console.log(' 清空现有数据...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'user_sessions', 'notifications', 'comments', 'collections',
      'likes', 'post_tags', 'follows', 'post_images', 'posts',
      'tags', 'users', 'admin'
    ];

    for (const table of tables) {
      try {
        await connection.execute(`TRUNCATE TABLE ${table}`);
        console.log(`     已清空 ${table} 表`);
      } catch (error) {
        if (!error.message.includes("doesn't exist")) {
          console.warn(`   ⚠️ 清空 ${table} 表失败: ${error.message}`);
        }
      }
    }

    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('数据清空完成');
  }

  //生成管理员数据
  generateAdmins() {
    return [
      { username: 'admin', password: '123456' },
      { username: 'admin2', password: '123456' },
      { username: 'admin3', password: '123456' }
    ];
  }

  // 插入管理员数据（密码使用SHA2哈希加密）
  async insertAdmins(connection, admins) {
    for (const admin of admins) {
      await connection.execute(
        'INSERT INTO admin (username, password) VALUES (?, SHA2(?, 256))',
        [admin.username, admin.password]
      );
    }
    console.log(`     已插入 ${admins.length} 个管理员账户`);
  }

  // 插入用户数据（密码使用SHA2哈希加密）
  async insertUsers(connection, users) {
    for (const user of users) {
      const result = await connection.execute(
        'INSERT INTO users (user_id, password, nickname, avatar, bio, location, follow_count, fans_count, like_count, is_active, last_login_at, gender, zodiac_sign, mbti, education, major, interests) VALUES (?, SHA2(?, 256), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user.user_id, user.password, user.nickname, user.avatar, user.bio, user.location, 0, 0, 0, user.is_active, user.last_login_at, user.gender, user.zodiac_sign, user.mbti, user.education, user.major, user.interests]
      );
      // 更新用户对象的id字段为数据库自增id
      user.id = result[0].insertId;
      await this.delay(50);
    }
    console.log(`     已插入 ${users.length} 个用户`);
  }

  // 插入标签数据
  async insertTags(connection, tags) {
    for (const tag of tags) {
      await connection.execute(
        'INSERT INTO tags (name, use_count) VALUES (?, ?)',
        [tag.name, 0]
      );
    }
    console.log(`     已插入 ${tags.length} 个标签`);
  }

  // 插入笔记数据
  async insertPosts(connection, posts) {
    for (const post of posts) {
      await connection.execute(
        'INSERT INTO posts (user_id, title, content, category, is_draft, view_count, like_count, collect_count, comment_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [post.user_id, post.title, post.content, post.category, post.is_draft, post.view_count, 0, 0, 0]
      );
      await this.delay(50);
    }
    console.log(`     已插入 ${posts.length} 个笔记`);
  }

  // 插入笔记图片数据
  async insertPostImages(connection, postImages) {
    for (const image of postImages) {
      await connection.execute(
        'INSERT INTO post_images (post_id, image_url) VALUES (?, ?)',
        [image.post_id, image.image_url]
      );
      await this.delay(30);
    }
    console.log(`     已插入 ${postImages.length} 个笔记图片`);
  }



  // 插入关注关系数据并更新用户统计
  async insertFollowsWithStats(connection, follows, userCount) {
    const userFollowStats = {}; // 用户关注统计
    const userFansStats = {}; // 用户粉丝统计

    // 初始化统计
    for (let i = 1; i <= userCount; i++) {
      userFollowStats[i] = 0;
      userFansStats[i] = 0;
    }

    // 插入关注关系并统计
    for (const follow of follows) {
      await connection.execute(
        'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        [follow.follower_id, follow.following_id]
      );

      // 更新统计
      userFollowStats[follow.follower_id]++;
      userFansStats[follow.following_id]++;
    }

    // 更新用户关注和粉丝数
    for (let userId = 1; userId <= userCount; userId++) {
      await connection.execute(
        'UPDATE users SET follow_count = ?, fans_count = ? WHERE id = ?',
        [userFollowStats[userId], userFansStats[userId], userId]
      );
    }

    console.log(`     已插入 ${follows.length} 个关注关系并更新用户统计`);
  }

  //生成随机用户数据
  generateUsers(count = 50) {
    const users = [];
    const bios = [
      '热爱生活，记录美好瞬间 ✨',
      '一个爱笑的女孩子，分享日常小确幸 😊',
      '学生党 | 爱学习爱生活 📚',
      '摄影爱好者 | 用镜头记录世界 📷',
      '美食探索者 | 吃遍天下美食 🍜',
      '旅行达人 | 世界那么大，我想去看看 ✈️',
      '手工爱好者 | 用双手创造美好 🎨',
      '读书人 | 书中自有黄金屋 📖',
      '音乐发烧友 | 生活需要BGM 🎵',
      '健身小达人 | 自律给我自由 💪',
      '宠物奴才 | 我家主子最可爱 🐱',
      '植物妈妈 | 和绿植一起成长 🌱',
      '咖啡控 | 没有咖啡的日子不完整 ☕',
      '电影迷 | 光影世界的探索者 🎬',
      '游戏玩家 | 虚拟世界的冒险家 🎮',
      '二次元少女 | 永远18岁 🌸',
      '古风爱好者 | 愿得一人心，白首不相离 🏮',
      '科技控 | 追求极客精神 💻',
      '理财小白 | 努力实现财务自由 💰',
      '创业者 | 梦想还是要有的 🚀',
      '设计师 | 用设计改变世界 🎨',
      '程序员 | 代码改变世界 👨‍💻',
      '教师 | 传道授业解惑 👩‍🏫',
      '医学生 | 救死扶伤是使命 👩‍⚕️',
      '法学生 | 正义永不缺席 ⚖️',
      '心理学爱好者 | 探索内心世界 🧠',
      '环保主义者 | 保护地球从我做起 🌍',
      '极简主义者 | 少即是多 ✨',
      '收纳达人 | 整理改变生活 📦',
      '烘焙爱好者 | 甜蜜生活的创造者 🧁',
      '瑜伽练习者 | 身心合一的修行 🧘‍',
      '跑步爱好者 | 奔跑是最好的修行 🏃‍♀️',
      '书法爱好者 | 一笔一划皆修行 ✍️',
      '茶艺爱好者 | 品茶品人生 🍵',
      '花艺师 | 用花朵装点生活 💐',
      '插画师 | 用画笔诉说故事 🖌️',
      '自由撰稿人 | 文字是我的武器 ✒️',
      '翻译工作者 | 语言的桥梁 🌐',
      '志愿者 | 用爱心温暖世界 ❤️',
      '独立思考者 | 保持理性与批判 🤔',
      '终身学习者 | 活到老学到老 📚',
      '时间管理达人 | 效率就是生命 ⏰',
      '断舍离践行者 | 简单生活更自由 🕊️',
      '正能量传播者 | 做自己的太阳 ☀️',
      '梦想追逐者 | 永远年轻，永远热泪盈眶 🌟',
      '生活美学家 | 把日子过成诗 🌺',
      '情感博主 | 用文字治愈心灵 💝',
      '知识分享者 | 分享让知识更有价值 🎓',
      '温柔的人 | 愿世界温柔以待 🤗',
      '努力生活的普通人 | 平凡而不平庸 🌈'
    ];

    // 6大信息的选项池
    const genders = ['male', 'female'];
    const zodiacSigns = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
    const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    const educations = ['高中', '大专', '本科', '硕士', '博士'];
    const majors = ['计算机科学', '软件工程', '电子信息', '机械工程', '土木工程', '建筑学', '经济学', '金融学', '会计学', '市场营销', '工商管理', '人力资源', '法学', '新闻传播', '汉语言文学', '英语', '心理学', '教育学', '医学', '护理学', '药学', '生物学', '化学', '物理学', '数学', '艺术设计', '音乐', '美术', '体育'];
    const interestOptions = ['阅读', '电影', '音乐', '旅行', '摄影', '美食', '健身', '游戏', '绘画', '书法', '舞蹈', '唱歌', '乐器', '编程', '设计', '写作', '手工', '园艺', '宠物', '收藏', '运动', '瑜伽', '冥想', '烹饪', '烘焙', '茶艺', '咖啡', '红酒', '时尚', '化妆', '护肤', '购物', '投资', '创业', '志愿服务', '环保', '公益'];

    for (let i = 0; i < count; i++) {
      // 随机生成兴趣（2-5个）
      const userInterests = [];
      const interestCount = Math.floor(Math.random() * 4) + 2; // 2-5个兴趣
      const shuffledInterests = [...interestOptions].sort(() => 0.5 - Math.random());
      for (let j = 0; j < interestCount; j++) {
        userInterests.push(shuffledInterests[j]);
      }

      const user = {
        user_id: `user${String(i + 1).padStart(3, '0')}`, // 小红书号，字符串格式
        password: '123456', // 使用明文密码
        nickname: this.usernames[i], // 按顺序使用usernames数组，不重复
        avatar: this.generateRandomAvatarUrl(),
        bio: bios[Math.floor(Math.random() * bios.length)],
        location: this.locations[i], // 按顺序使用locations数组，不重复
        follow_count: Math.floor(Math.random() * 500),
        fans_count: Math.floor(Math.random() * 1000),
        like_count: Math.floor(Math.random() * 5000),
        is_active: 1, // 添加is_active字段
        last_login_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // 添加last_login_at字段（随机30天内）
        // 6大信息字段（70%概率填写，30%概率为空）
        gender: Math.random() > 0.3 ? genders[Math.floor(Math.random() * genders.length)] : null,
        zodiac_sign: Math.random() > 0.3 ? zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)] : null,
        mbti: Math.random() > 0.3 ? mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)] : null,
        education: Math.random() > 0.3 ? educations[Math.floor(Math.random() * educations.length)] : null,
        major: Math.random() > 0.3 ? majors[Math.floor(Math.random() * majors.length)] : null,
        interests: Math.random() > 0.3 ? JSON.stringify(userInterests) : null
      };
      users.push(user);
    }
    return users;
  }

  //生成随机标签数据
  generateTags() {
    const allTags = [];
    Object.values(this.categoryData).forEach(category => {
      allTags.push(...category.tags);
    });

    // 去重并生成标签数据
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.map(tag => ({
      name: tag,
      use_count: Math.floor(Math.random() * 200) + 10
    }));
  }

  //生成随机笔记数据
  generatePosts(userCount, count = 200) {
    const posts = [];
    for (let i = 0; i < count; i++) {
      const category = this.categories[Math.floor(Math.random() * this.categories.length)];
      const categoryInfo = this.categoryData[category];

      const post = {
        user_id: Math.floor(Math.random() * userCount) + 1,
        title: categoryInfo.titles[Math.floor(Math.random() * categoryInfo.titles.length)],
        content: categoryInfo.contents[Math.floor(Math.random() * categoryInfo.contents.length)],
        category: category, // 使用英文分类名
        is_draft: 0, // 灌装数据全部为已发布状态（0表示非草稿）
        view_count: Math.floor(Math.random() * 10000),
        like_count: Math.floor(Math.random() * 500),
        collect_count: Math.floor(Math.random() * 100),
        comment_count: Math.floor(Math.random() * 50)
      };
      posts.push(post);
    }
    return posts;
  }

  //生成笔记图片数据
  generatePostImages(postCount, maxImagesPerPost = 5) {
    const images = [];
    for (let postId = 1; postId <= postCount; postId++) {
      const imageCount = Math.floor(Math.random() * maxImagesPerPost) + 1;
      for (let i = 0; i < imageCount; i++) {
        images.push({
          post_id: postId,
          image_url: this.generateRandomImageUrl()
        });
      }
    }
    return images;
  }

  //生成关注关系数据
  generateFollows(userCount, count = 300) {
    const follows = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      let follower_id, following_id;
      do {
        follower_id = Math.floor(Math.random() * userCount) + 1;
        following_id = Math.floor(Math.random() * userCount) + 1;
      } while (follower_id === following_id || used.has(`${follower_id}-${following_id}`));

      used.add(`${follower_id}-${following_id}`);
      follows.push({ follower_id, following_id });
    }
    return follows;
  }

  //生成点赞数据
  generateLikes(userCount, postCount, commentCount, count = 1000) {
    const likes = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      let user_id, target_id;
      const target_type = Math.random() > 0.8 ? 2 : 1; // 80%点赞笔记，20%点赞评论

      do {
        user_id = Math.floor(Math.random() * userCount) + 1;
        if (target_type === 1) {
          // 点赞笔记
          target_id = Math.floor(Math.random() * postCount) + 1;
        } else {
          // 点赞评论
          target_id = Math.floor(Math.random() * commentCount) + 1;
        }
      } while (used.has(`${user_id}-${target_type}-${target_id}`));

      used.add(`${user_id}-${target_type}-${target_id}`);
      likes.push({ user_id, target_type, target_id });
    }
    return likes;
  }

  //生成收藏数据
  generateCollections(userCount, postCount, count = 400) {
    const collections = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      let user_id, post_id;
      do {
        user_id = Math.floor(Math.random() * userCount) + 1;
        post_id = Math.floor(Math.random() * postCount) + 1;
      } while (used.has(`${user_id}-${post_id}`));

      used.add(`${user_id}-${post_id}`);
      collections.push({ user_id, post_id });
    }
    return collections;
  }

  //生成评论数据
  generateComments(users, postCount, count = 800) {
    const userCount = users.length;
    const comments = [];
    const commentTexts = [
      // 表达赞同和支持
      '很棒的分享！', '学到了很多', '感谢分享', '很有用的内容', '支持楼主', '写得很好', '很有启发', '收藏了',
      '同感', '很实用', '谢谢分享', '很有意思', '赞同你的观点', '很有道理', '学习了', '很棒的经验',
      '说得太对了！', '深有同感', '受益匪浅', '太有用了', '必须点赞', '说到心坎里了', '完全同意',

      // 表达疑问和讨论
      '有个问题想请教一下', '这个方法真的有效吗？', '能详细说说吗？', '有没有更好的建议？',
      '我觉得还可以这样...', '补充一点', '我的经验是...', '不过我觉得...', '另外一个角度来看',
      '有没有遇到过这种情况？', '求更多细节', '能分享下具体操作吗？', '有类似经历',

      // 表达感谢和鼓励
      '谢谢楼主的分享', '真的帮到我了', '正好需要这个', '解决了我的困惑', '及时雨啊',
      '楼主太厉害了', '继续加油', '期待更多分享', '关注了', '马克一下',

      // 表达情感共鸣
      '太真实了', '说出了我的心声', '感同身受', '我也是这样想的', '引起共鸣了',
      '看哭了', '太感动了', '很温暖', '正能量满满', '很治愈',

      // 日常互动
      '沙发！', '前排支持', '来晚了', '围观学习', '默默点赞', '路过留名',
      '顶一个', '好文章', '值得收藏', '转发了', '分享给朋友',

      // 具体建议和补充
      '建议可以试试...', '我一般会这样做', '还有一个小技巧', '注意这个细节',
      '我的做法是...', '推荐一个工具', '可以参考这个', '类似的还有...',

      // 表达不同观点（礼貌）
      '我有不同看法', '可能因人而异吧', '我的情况有点不同', '也许还有其他方式',
      '个人觉得...', '从我的角度来看', '可能需要具体分析', '情况比较复杂',

      // 校园相关
      '学长学姐太厉害了', '作为学弟学妹表示膜拜', '这就是大学生活啊', '青春回忆杀',
      '想念校园时光', '现在的学生真幸福', '当年我们也是这样', '时代不同了',

      // 生活感悟
      '生活不易', '且行且珍惜', '每天都在成长', '感谢生活的美好',
      '平凡中的小确幸', '简单就是幸福', '知足常乐', '珍惜当下',

      // 网络用语
      '666', '牛啊', 'yyds', '绝了', '太强了', '服气', '厉害厉害',
      '学废了', '我酸了', '柠檬精上线', '这就是差距', '人比人气死人'
    ];

    // 带 @用户的评论模板
    const mentionCommentTemplates = [
      ' 这个内容不错，你可以看看 ',
      ' 这个挺有意思的，分享给你 ',
      ' 这个值得一看，你肯定会感兴趣 ',
      ' 觉得这个对你有帮助，过来看看 ',
      ' 这个挺好的，推荐给你 ',
      ' 看到这个就想到你了，来看看吧 ',
      ' 这个内容不错，你可能会喜欢 ',
      ' 这个挺有价值的，分享给你 ',
      ' 这个值得关注，你可以了解下 ',
      ' 觉得这个不错，你也看看吧 ',
      ' 这个内容挺好，推荐你看一下 ',
      ' 这个挺实用的，你可以参考下 ',
      ' 看到这个就想让你也看看 ',
      ' 这个内容不错，分享给你参考 ',
      ' 这个挺有意思，你过来看看 '
    ];


    // 按笔记分组生成评论，确保回复评论的parent_id指向同一笔记下的评论
    const commentsByPost = {};

    for (let i = 0; i < count; i++) {
      const postId = Math.floor(Math.random() * postCount) + 1;

      // 初始化该笔记的评论数组
      if (!commentsByPost[postId]) {
        commentsByPost[postId] = [];
      }

      const existingCommentsForPost = commentsByPost[postId];
      let parentId = null;

      // 30%的概率生成回复评论，且该笔记下必须已有评论
      if (existingCommentsForPost.length > 0 && Math.random() > 0.7) {
        // 随机选择该笔记下的一个已存在评论作为父评论
        const randomIndex = Math.floor(Math.random() * existingCommentsForPost.length);
        parentId = existingCommentsForPost[randomIndex].id;
      }

      let content;

      // 15%的概率生成带@用户的评论
      if (Math.random() < 0.15) {
        // 随机选择一个用户进行@
        const mentionedUserIndex = Math.floor(Math.random() * userCount);
        const mentionedUser = users[mentionedUserIndex];
        const mentionedUserDisplayId = mentionedUser.user_id;
        const mentionedNickname = mentionedUser.nickname;
        const mentionText = mentionCommentTemplates[Math.floor(Math.random() * mentionCommentTemplates.length)];

        //生成HTML格式的@用户评论
        content = `<p><a href="/user/${mentionedUserDisplayId}" data-user-id="${mentionedUserDisplayId}" class="mention-link" contenteditable="false">@${mentionedNickname}</a>&nbsp;${mentionText}</p>`;
      } else {
        //生成普通评论
        content = commentTexts[Math.floor(Math.random() * commentTexts.length)];
      }

      const comment = {
        id: i + 1, // 临时ID，用于生成过程中的引用
        post_id: postId,
        user_id: Math.floor(Math.random() * userCount) + 1,
        parent_id: parentId,
        content: content,
        like_count: Math.floor(Math.random() * 20)
      };

      // 添加到对应笔记的评论列表中
      commentsByPost[postId].push(comment);
      comments.push(comment);
    }

    // 移除临时ID字段
    return comments.map(comment => {
      const { id, ...commentWithoutId } = comment;
      return commentWithoutId;
    });
  }


  //生成用户会话数据 - 每个用户一条session记录
  generateUserSessions(userCount) {
    const sessions = [];
    const userAgents = [
      // Windows Chrome
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

      // Windows Edge
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',

      // Windows Firefox
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',

      // macOS Chrome
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

      // macOS Safari
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',

      // iPhone Safari
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',

      // Android Chrome
      'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

      // Android Firefox
      'Mozilla/5.0 (Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
      'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',

      // iPad Safari
      'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    ];

    // 真实的中国公网IP地址段
    const ipRanges = [
      // 中国电信
      () => `59.${Math.floor(Math.random() * 64) + 32}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 59.32.0.0/11
      () => `61.${Math.floor(Math.random() * 64) + 128}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 61.128.0.0/10
      () => `114.${Math.floor(Math.random() * 64) + 80}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 114.80.0.0/12
      () => `183.${Math.floor(Math.random() * 64) + 192}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 183.192.0.0/10

      // 中国联通
      () => `123.${Math.floor(Math.random() * 128) + 112}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 123.112.0.0/12
      () => `125.${Math.floor(Math.random() * 64) + 64}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 125.64.0.0/11
      () => `221.${Math.floor(Math.random() * 32) + 192}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 221.192.0.0/11

      // 中国移动
      () => `117.${Math.floor(Math.random() * 64) + 128}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 117.128.0.0/10
      () => `223.${Math.floor(Math.random() * 64) + 64}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 223.64.0.0/10

      // 其他中国ISP
      () => `101.${Math.floor(Math.random() * 64) + 64}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 101.64.0.0/11
      () => `106.${Math.floor(Math.random() * 64) + 80}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 106.80.0.0/12
      () => `112.${Math.floor(Math.random() * 64) + 64}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 112.64.0.0/11
      () => `119.${Math.floor(Math.random() * 64) + 128}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` // 119.128.0.0/11
    ];

    // 为每个用户生成一条session记录
    for (let userId = 1; userId <= userCount; userId++) {
      const session = {
        user_id: userId,
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refresh_token: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
        is_active: Math.random() > 0.2 ? 1 : 0 // 80%活跃
      };
      sessions.push(session);
    }
    return sessions;
  }

  //生成用户标签数据


  // 插入数据到数据库
  async insertData() {
    let connection;
    try {
      console.log('开始生成模拟数据...');

      // 创建数据库连接
      connection = await mysql.createConnection(dbConfig);
      console.log('数据库连接成功');

      // 清空现有数据
      await this.clearTables(connection);

      // 第零步：生成并插入管理员数据
      console.log('生成管理员数据...');
      const admins = this.generateAdmins();
      await this.insertAdmins(connection, admins);

      // 第一步：生成并插入用户数据（初始统计为0）
      console.log('生成用户数据...');
      const users = this.generateUsers(50);
      await this.insertUsers(connection, users);

      // 第二步：生成并插入标签数据（初始使用次数为0）
      console.log('生成标签数据...');
      const tags = this.generateTags();
      await this.insertTags(connection, tags);

      // 第三步：生成并插入笔记数据（初始统计为0）
      console.log('生成笔记数据...');
      const posts = this.generatePosts(users.length, 200);
      await this.insertPosts(connection, posts);

      // 第四步：生成并插入笔记图片数据
      console.log('生成笔记图片数据...');
      const postImages = this.generatePostImages(posts.length);
      await this.insertPostImages(connection, postImages);

      // 第五步：生成并插入关注关系数据，同时更新用户统计
      console.log('生成关注关系数据...');
      const follows = this.generateFollows(users.length, 300);
      await this.insertFollowsWithStats(connection, follows, users.length);

      // 第六步：生成并插入评论数据，同时更新笔记统计
      console.log('生成评论数据...');
      const comments = this.generateComments(users, posts.length, 800);
      const postCommentStats = {}; // 笔记评论统计
      const insertedCommentIds = []; // 存储已插入的评论ID

      // 初始化统计
      for (let i = 1; i <= posts.length; i++) {
        postCommentStats[i] = 0;
      }

      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const result = await connection.execute(
          'INSERT INTO comments (post_id, user_id, parent_id, content, like_count) VALUES (?, ?, ?, ?, ?)',
          [comment.post_id, comment.user_id, comment.parent_id, comment.content, comment.like_count]
        );

        // 存储插入后的评论ID
        const insertedId = result[0].insertId;
        insertedCommentIds.push(insertedId);
        comments[i].id = insertedId; // 更新评论对象的ID

        postCommentStats[comment.post_id]++;
      }

      // 更新笔记评论数
      for (let postId = 1; postId <= posts.length; postId++) {
        await connection.execute(
          'UPDATE posts SET comment_count = ? WHERE id = ?',
          [postCommentStats[postId], postId]
        );
      }

      console.log(`     已插入 ${comments.length} 个评论并更新笔记统计`);

      // 第七步：生成并插入点赞数据，同时更新笔记和用户统计
      console.log('生成点赞数据...');
      const likes = this.generateLikes(users.length, posts.length, comments.length, 1000);
      const postLikeStats = {}; // 笔记点赞统计
      const userLikeStats = {}; // 用户获得点赞统计

      // 初始化统计
      for (let i = 1; i <= posts.length; i++) {
        postLikeStats[i] = 0;
      }
      for (let i = 1; i <= users.length; i++) {
        userLikeStats[i] = 0;
      }

      for (const like of likes) {
        await connection.execute(
          'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
          [like.user_id, like.target_type, like.target_id]
        );

        // 如果是点赞笔记
        if (like.target_type === 1) {
          postLikeStats[like.target_id]++;

          // 获取笔记作者，增加其获得点赞数
          const postAuthor = posts[like.target_id - 1].user_id;
          userLikeStats[postAuthor]++;
        }
      }

      // 更新笔记点赞数
      for (let postId = 1; postId <= posts.length; postId++) {
        await connection.execute(
          'UPDATE posts SET like_count = ? WHERE id = ?',
          [postLikeStats[postId], postId]
        );
      }

      // 更新用户获得点赞数
      for (let userId = 1; userId <= users.length; userId++) {
        await connection.execute(
          'UPDATE users SET like_count = ? WHERE id = ?',
          [userLikeStats[userId], userId]
        );
      }

      // 第八步：生成并插入收藏数据，同时更新笔记统计
      console.log('生成收藏数据...');
      const collections = this.generateCollections(users.length, posts.length, 400);
      const postCollectStats = {}; // 笔记收藏统计

      // 初始化统计
      for (let i = 1; i <= posts.length; i++) {
        postCollectStats[i] = 0;
      }

      for (const collection of collections) {
        await connection.execute(
          'INSERT INTO collections (user_id, post_id) VALUES (?, ?)',
          [collection.user_id, collection.post_id]
        );

        postCollectStats[collection.post_id]++;
      }

      // 更新笔记收藏数
      for (let postId = 1; postId <= posts.length; postId++) {
        await connection.execute(
          'UPDATE posts SET collect_count = ? WHERE id = ?',
          [postCollectStats[postId], postId]
        );
      }

      // 第九步：生成笔记标签关联数据，同时更新标签使用次数
      console.log('生成笔记标签关联数据...');
      const tagUseStats = {}; // 标签使用统计

      // 初始化统计
      for (let i = 1; i <= tags.length; i++) {
        tagUseStats[i] = 0;
      }

      for (let postId = 1; postId <= posts.length; postId++) {
        const tagCount = Math.floor(Math.random() * 3) + 1;
        const usedTags = new Set();
        for (let i = 0; i < tagCount; i++) {
          let tagId;
          do {
            tagId = Math.floor(Math.random() * tags.length) + 1;
          } while (usedTags.has(tagId));
          usedTags.add(tagId);

          await connection.execute(
            'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
            [postId, tagId]
          );

          tagUseStats[tagId]++;
        }
      }

      // 更新标签使用次数
      for (let tagId = 1; tagId <= tags.length; tagId++) {
        await connection.execute(
          'UPDATE tags SET use_count = ? WHERE id = ?',
          [tagUseStats[tagId], tagId]
        );
      }

      // 第十步：基于实际数据生成通知
      console.log('生成通知数据...');
      const notifications = [];

      /*
       * 通知类型定义：
       * 1 - 点赞笔记：赞了你的笔记
       * 2 - 点赞评论：赞了你的评论
       * 3 - 收藏笔记：收藏了你的笔记
       * 4 - 评论笔记：评论了你的笔记
       * 5 - 回复评论：回复了你的评论
       * 6 - 关注：关注了你（前端根据互关状态渲染为"关注了你"或"回关了你"）
       * 7 - @提及：在评论中@了你
       */

      // 基于点赞生成通知
      for (const like of likes) {
        if (like.target_type === 1) { // 点赞笔记
          const postAuthor = posts[like.target_id - 1].user_id;
          if (like.user_id !== postAuthor) { // 不给自己发通知
            const notificationData = NotificationHelper.createLikePostNotification(
              postAuthor,
              like.user_id,
              like.target_id
            );
            notificationData.is_read = Math.random() > 0.4 ? 1 : 0;
            notifications.push(notificationData);
          }
        } else if (like.target_type === 2) { // 点赞评论
          // 需要找到评论的作者
          const comment = comments.find(c => c.id === like.target_id);
          if (comment && like.user_id !== comment.user_id) { // 不给自己发通知
            const notificationData = NotificationHelper.createLikeCommentNotification(
              comment.user_id,
              like.user_id,
              comment.post_id, // 使用笔记ID便于跳转
              comment.id // 关联具体评论
            );
            notificationData.is_read = Math.random() > 0.4 ? 1 : 0;
            notifications.push(notificationData);
          }
        }
      }

      // 基于评论生成通知
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];

        // 检查评论是否包含@用户，生成@提及通知
        if (comment.content && comment.content.includes('mention-link')) {
          // 提取@用户信息（简化处理，从HTML中提取data-user-id）
          const mentionMatches = comment.content.match(/data-user-id="([^"]+)"/g);
          if (mentionMatches) {
            for (const match of mentionMatches) {
              const userIdMatch = match.match(/data-user-id="([^"]+)"/);
              if (userIdMatch) {
                const mentionedUserDisplayId = userIdMatch[1];
                // 根据display_id找到对应的自增ID
                const mentionedUser = users.find(u => u.user_id === mentionedUserDisplayId);
                if (mentionedUser && mentionedUser.id !== comment.user_id) { // 不给自己发通知
                  const notificationData = NotificationHelper.createMentionNotification(
                    mentionedUser.id,
                    comment.user_id,
                    comment.post_id,
                    comment.id
                  );
                  notificationData.is_read = Math.random() > 0.4 ? 1 : 0;
                  notifications.push(notificationData);
                }
              }
            }
          }
        }

        if (comment.parent_id) {
          // 回复评论的通知
          const parentComment = comments.find(c => c.id === comment.parent_id);
          if (parentComment && comment.user_id !== parentComment.user_id) { // 不给自己发通知
            const notificationData = NotificationHelper.createReplyCommentNotification(
              parentComment.user_id,
              comment.user_id,
              comment.post_id,
              comment.id // 关联具体回复评论
            );
            notificationData.is_read = Math.random() > 0.4 ? 1 : 0;
            notifications.push(notificationData);
          }
        } else {
          // 评论笔记的通知
          const postAuthor = posts[comment.post_id - 1].user_id;
          if (comment.user_id !== postAuthor) { // 不给自己发通知
            const notificationData = NotificationHelper.createCommentPostNotification(
              postAuthor,
              comment.user_id,
              comment.post_id,
              comment.id // 关联具体评论
            );
            notificationData.is_read = Math.random() > 0.4 ? 1 : 0;
            notifications.push(notificationData);
          }
        }
      }

      // 基于关注生成通知
      for (const follow of follows) {
        const notificationData = NotificationHelper.createFollowNotification(
          follow.following_id,
          follow.follower_id
        );
        notificationData.is_read = Math.random() > 0.4 ? 1 : 0;
        notifications.push(notificationData);
      }

      // 基于收藏生成通知
      for (const collection of collections) {
        const postAuthor = posts[collection.post_id - 1].user_id;
        if (collection.user_id !== postAuthor) { // 不给自己发通知
          const notificationData = NotificationHelper.createCollectPostNotification(
            postAuthor,
            collection.user_id,
            collection.post_id
          );
          notificationData.is_read = Math.random() > 0.4 ? 1 : 0;
          notifications.push(notificationData);
        }
      }

      // 插入通知数据
      for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];

        // 检查是否有undefined字段
        const params = [notification.user_id, notification.sender_id, notification.type, notification.title, notification.target_id, notification.comment_id || null, notification.is_read];
        const hasUndefined = params.some(param => param === undefined);

        if (hasUndefined) {
          console.error(`Notification ${i} has undefined parameters:`, {
            user_id: notification.user_id,
            sender_id: notification.sender_id,
            type: notification.type,
            title: notification.title,
            target_id: notification.target_id,
            comment_id: notification.comment_id,
            is_read: notification.is_read
          });
          continue; // 跳过这个有问题的通知
        }

        await connection.execute(
          'INSERT INTO notifications (user_id, sender_id, type, title, target_id, comment_id, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
          params
        );
      }

      // 第十一步：生成并插入用户会话数据 - 每个用户一条session
      console.log('生成用户会话数据...');
      const userSessions = this.generateUserSessions(users.length);
      for (const session of userSessions) {
        await connection.execute(
          'INSERT INTO user_sessions (user_id, token, refresh_token, expires_at, user_agent, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [session.user_id, session.token, session.refresh_token, session.expires_at, session.user_agent, session.is_active]
        );
      }

      console.log('模拟数据生成完成！');
      console.log(`  数据统计:`);
      console.log(`   管理员: ${admins.length} 个`);
      console.log(`   用户: ${users.length} 个`);
      console.log(`   标签: ${tags.length} 个`);
      console.log(`   笔记: ${posts.length} 个`);
      console.log(`   图片: ${postImages.length} 张`);
      console.log(`   关注关系: ${follows.length} 个`);
      console.log(`   点赞: ${likes.length} 个`);
      console.log(`   收藏: ${collections.length} 个`);
      console.log(`   评论: ${comments.length} 个`);
      console.log(`   通知: ${notifications.length} 个`);
      console.log(`   会话: ${userSessions.length} 个`);
      console.log(`   分类列表: ${this.categories.join(', ')}`);

    } catch (error) {
      console.error('生成模拟数据失败:', error);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}

// 运行数据生成器
if (require.main === module) {
  const generator = new DataGenerator();
  generator.insertData();
}

module.exports = DataGenerator;