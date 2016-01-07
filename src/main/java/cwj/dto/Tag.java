package cwj.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author blueden
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {
    private String name;
    private LocalDateTime created_at;
    private int id;
    private int sort_order;
    private LocalDateTime updated_at;
}