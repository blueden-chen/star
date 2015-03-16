package net.core.db;

import com.mysql.jdbc.Connection;
import net.core.model.StarredRepo;
import net.core.model.User;
import org.apache.commons.dbutils.DbUtils;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;


/**
 * Created by chenwj on 3/14/15.
 */
public class MysqlUtils {
    private static Logger logger = LoggerFactory.getLogger(MysqlUtils.class);
//    private static Mongo mg;
//
//    static {
//        try {
//            mg = new Mongo();
//        } catch (UnknownHostException e) {
//
//            logger.debug("mongo init exception.");
//        }
//    }

    final static String url = "jdbc:mysql://localhost:3306/astral";
    final static String driver = "com.mysql.jdbc.Driver";
    final static String usr = "root";
    final static String pwd = "root";

    static QueryRunner run;
    static Connection conn;

    static {
        run = new QueryRunner();
        DbUtils.loadDriver(driver);
//        try {
//            conn = (Connection) DriverManager.getConnection(url, usr, pwd);
//        } catch (SQLException e) {
//            logger.error(e.getMessage());
//        }
    }
    // -----------------------------------------------------------------------------------

    public static void openConnection() {
        try {
            conn = (Connection) DriverManager.getConnection(url, usr, pwd);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static List<Map<String, Object>> query(String sql) {
        List<Map<String, Object>> maps = null;
        try {
            maps = run.query(conn, sql, new MapListHandler());
        } catch (SQLException e) {
            logger.error(e.getMessage());
        }

        return maps;
    }

    public static void close() {
        try {
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void store(int id, List<StarredRepo> starredRepos) {
        try {
            for (StarredRepo starredRepo : starredRepos) {
                String sql = String.format("insert into starred_repo(id,full_name) values(%d,%s) where not exists(select id from starred_repo where id = %d and full_name=%s)limit 1", id, starredRepo.full_name, id, starredRepo.full_name);
                run.update(conn, sql);
            }
        } catch (SQLException e) {
            logger.error(e.getMessage());
        }
    }

    public static void store(User user) {
        try {
            String sql = String.format("insert into user values(%d,%s,%d,%d,%d,%s,%d) where not exists(select id from user where id=?)limit 1", user.id, user.login, user.followers, user.followings, user.public_repos, user.bio, user.id);
            logger.debug(sql);
            run.update(conn, sql);
        } catch (SQLException e) {
            logger.error(e.getMessage());
        }

    }

    public static List<Map<String, Object>> queryStarredRepos(int id) {
        String sql = String.format("select * from starred_repo where id = '%d'", id);
        logger.debug(sql);
        return query(sql);
    }
}
