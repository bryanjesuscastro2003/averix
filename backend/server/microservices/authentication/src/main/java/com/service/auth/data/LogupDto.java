package com.service.auth.data;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogupDto {
    private String username;
    private String password;
    private int age;
    private List<String> role;
    private boolean active;
}
